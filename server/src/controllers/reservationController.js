const Reservation = require('../models/Reservation');
const Inventory = require('../models/Inventory');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');

// @desc    Create a new medicine reservation
// @route   POST /api/reservations
// @access  Private (User)
const createReservation = async (req, res) => {
  try {
    const { pharmacyId, medicineId, quantity = 1, customerPhone, pickupNotes } = req.body;

    if (!pharmacyId || !medicineId) {
      return res.status(400).json({ message: 'Pharmacy and medicine are required' });
    }

    const inventoryItem = await Inventory.findOne({
      pharmacy: pharmacyId,
      medicine: medicineId,
    });

    if (!inventoryItem || !inventoryItem.isAvailable || inventoryItem.stock < quantity) {
      return res.status(400).json({
        message: 'This medicine is currently out of stock or insufficient quantity at the selected pharmacy',
      });
    }

    const unitPrice = inventoryItem.price;
    const totalPrice = unitPrice * Number(quantity);

    const reservation = await Reservation.create({
      user: req.user._id,
      pharmacy: pharmacyId,
      medicine: medicineId,
      quantity: Number(quantity),
      unitPrice,
      totalPrice,
      customerPhone: customerPhone || req.user.phone || '',
      pickupNotes: pickupNotes || '',
      status: 'Pending',
    });

    // Deduct reserved stock
    inventoryItem.stock -= Number(quantity);
    if (inventoryItem.stock <= 0) {
      inventoryItem.stock = 0;
      inventoryItem.isAvailable = false;
    }
    await inventoryItem.save();

    const populated = await Reservation.findById(reservation._id)
      .populate('pharmacy', 'name address city phone')
      .populate('medicine', 'name genericName dosage form');

    return res.status(201).json(populated);
  } catch (error) {
    console.error('Create Reservation Error:', error);
    return res.status(500).json({ message: 'Error creating reservation' });
  }
};

// @desc    Get user's reservations
// @route   GET /api/reservations/user
// @access  Private (User)
const getUserReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('pharmacy', 'name address city phone rating')
      .populate('medicine', 'name genericName dosage form mrp image')
      .sort({ createdAt: -1 });

    return res.json(reservations);
  } catch (error) {
    console.error('Get User Reservations Error:', error);
    return res.status(500).json({ message: 'Error fetching reservations' });
  }
};

// @desc    Get pharmacy's incoming reservations
// @route   GET /api/reservations/pharmacy
// @access  Private (Pharmacy Owner)
const getPharmacyReservations = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy profile not found' });
    }

    const reservations = await Reservation.find({ pharmacy: pharmacy._id })
      .populate('user', 'name email phone')
      .populate('medicine', 'name genericName dosage form mrp')
      .sort({ createdAt: -1 });

    return res.json(reservations);
  } catch (error) {
    console.error('Get Pharmacy Reservations Error:', error);
    return res.status(500).json({ message: 'Error fetching pharmacy reservations' });
  }
};

// @desc    Update reservation status
// @route   PUT /api/reservations/:id/status
// @access  Private (Pharmacy Owner / User for cancellation)
const updateReservationStatus = async (req, res) => {
  try {
    const { status, pharmacyNotes } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
    const isOwner = pharmacy && pharmacy._id.toString() === reservation.pharmacy.toString();
    const isCustomer = req.user._id.toString() === reservation.user.toString();

    if (!isOwner && !isCustomer && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this reservation' });
    }

    // Customer can only cancel their pending reservation
    if (isCustomer && !isOwner && status !== 'Cancelled') {
      return res.status(403).json({ message: 'Customers can only cancel a reservation' });
    }

    // If cancelling, restore stock
    if (status === 'Cancelled' && reservation.status !== 'Cancelled') {
      const inventoryItem = await Inventory.findOne({
        pharmacy: reservation.pharmacy,
        medicine: reservation.medicine,
      });
      if (inventoryItem) {
        inventoryItem.stock += reservation.quantity;
        inventoryItem.isAvailable = true;
        await inventoryItem.save();
      }
    }

    reservation.status = status;
    if (pharmacyNotes) {
      reservation.pharmacyNotes = pharmacyNotes;
    }

    await reservation.save();

    const updated = await Reservation.findById(reservation._id)
      .populate('user', 'name email phone')
      .populate('pharmacy', 'name address city phone')
      .populate('medicine', 'name genericName dosage form');

    return res.json(updated);
  } catch (error) {
    console.error('Update Status Error:', error);
    return res.status(500).json({ message: 'Error updating reservation status' });
  }
};

// @desc    Get dashboard summary statistics
// @route   GET /api/reservations/stats
// @access  Public
const getPlatformStats = async (req, res) => {
  try {
    const totalMedicines = await Medicine.countDocuments();
    const totalPharmacies = await Pharmacy.countDocuments();
    const totalReservations = await Reservation.countDocuments();

    return res.json({
      totalMedicines,
      totalPharmacies,
      totalReservations,
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    return res.status(500).json({ message: 'Error fetching stats' });
  }
};

module.exports = {
  createReservation,
  getUserReservations,
  getPharmacyReservations,
  updateReservationStatus,
  getPlatformStats,
};
