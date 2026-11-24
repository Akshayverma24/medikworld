const Inventory = require('../models/Inventory');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');

// @desc    Get inventory of currently logged-in pharmacy owner
// @route   GET /api/inventory/my
// @access  Private (Pharmacy Owner)
const getMyInventory = async (req, res) => {
  try {
    let pharmacy = await Pharmacy.findOne({ owner: req.user._id });
    if (!pharmacy) {
      // Auto-create pharmacy record if missing
      pharmacy = await Pharmacy.create({
        owner: req.user._id,
        name: `${req.user.name}'s Pharmacy`,
        licenseNumber: `DL-KA-2026-${Date.now().toString().slice(-4)}`,
        phone: req.user.phone || '+91 98765 43210',
        email: req.user.email,
        address: req.user.address || 'Central Market Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        openingHours: '8:30 AM - 10:30 PM',
      });
    }

    const inventory = await Inventory.find({ pharmacy: pharmacy._id })
      .populate('medicine')
      .sort({ updatedAt: -1 });

    return res.json({
      pharmacy,
      items: inventory,
      totalCount: inventory.length,
      lowStockCount: inventory.filter((item) => item.stock < 10).length,
    });
  } catch (error) {
    console.error('Get My Inventory Error:', error);
    return res.status(500).json({ message: 'Error retrieving pharmacy inventory' });
  }
};

// @desc    Add or update medicine stock & price in pharmacy inventory
// @route   POST /api/inventory
// @access  Private (Pharmacy Owner)
const upsertInventoryItem = async (req, res) => {
  try {
    const {
      medicineId,
      price,
      stock,
      isAvailable,
      name,
      genericName,
      category,
      dosage,
      form,
      mrp,
      manufacturer,
      image,
    } = req.body;

    let pharmacy = await Pharmacy.findOne({ owner: req.user._id });
    if (!pharmacy) {
      pharmacy = await Pharmacy.create({
        owner: req.user._id,
        name: `${req.user.name}'s Pharmacy`,
        licenseNumber: `DL-KA-2026-${Date.now().toString().slice(-4)}`,
        phone: req.user.phone || '+91 98765 43210',
        email: req.user.email,
        address: req.user.address || 'Main Road Market',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
      });
    }

    let targetMedicine = null;

    // 1. Try to find by medicineId if valid ObjectId
    if (medicineId && medicineId.match(/^[0-9a-fA-F]{24}$/)) {
      targetMedicine = await Medicine.findById(medicineId);
    }

    // 2. If not found by ID or if name provided, find by name or create
    if (!targetMedicine && name) {
      targetMedicine = await Medicine.findOne({
        name: new RegExp(`^${name.trim()}$`, 'i'),
      });

      if (!targetMedicine) {
        targetMedicine = await Medicine.create({
          name: name.trim(),
          genericName: genericName ? genericName.trim() : 'Standard Formulation',
          category: category || 'Other',
          manufacturer: manufacturer || 'Standard Pharmaceuticals',
          dosage: dosage || '500mg',
          form: form || 'Tablet',
          mrp: Number(mrp) || Number(price) || 50,
          description: `Prescribed pharmaceutical medication.`,
          image: image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
        });
      }
    }

    if (!targetMedicine) {
      return res.status(400).json({
        message: 'Could not identify medicine. Please provide a valid medicine or specify name and price.',
      });
    }

    let inventoryItem = await Inventory.findOne({
      pharmacy: pharmacy._id,
      medicine: targetMedicine._id,
    });

    const finalPrice = price !== undefined ? Number(price) : targetMedicine.mrp;
    const finalStock = stock !== undefined ? Number(stock) : 20;

    if (inventoryItem) {
      inventoryItem.price = finalPrice;
      inventoryItem.stock = finalStock;
      inventoryItem.isAvailable =
        isAvailable !== undefined ? isAvailable : finalStock > 0;
      await inventoryItem.save();
    } else {
      inventoryItem = await Inventory.create({
        pharmacy: pharmacy._id,
        medicine: targetMedicine._id,
        price: finalPrice,
        stock: finalStock,
        isAvailable: isAvailable !== undefined ? isAvailable : finalStock > 0,
        batchNumber: `BAT-2026-${Date.now().toString().slice(-4)}`,
        expiryDate: new Date('2027-11-20'),
      });
    }

    const populatedItem = await Inventory.findById(inventoryItem._id).populate('medicine');
    return res.status(200).json(populatedItem);
  } catch (error) {
    console.error('Upsert Inventory Error:', error);
    return res.status(400).json({ message: error.message || 'Error updating inventory' });
  }
};

// @desc    Update single inventory item (stock, price, availability)
// @route   PUT /api/inventory/:id
// @access  Private (Pharmacy Owner)
const updateInventoryItem = async (req, res) => {
  try {
    const { price, stock, isAvailable } = req.body;

    const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy profile not found' });
    }

    const item = await Inventory.findOne({ _id: req.params.id, pharmacy: pharmacy._id });
    if (!item) {
      return res.status(404).json({ message: 'Inventory record not found or unauthorized' });
    }

    if (price !== undefined) item.price = Number(price);
    if (stock !== undefined) {
      item.stock = Number(stock);
      item.isAvailable = Number(stock) > 0;
    }
    if (isAvailable !== undefined) item.isAvailable = isAvailable;

    await item.save();
    const populated = await Inventory.findById(item._id).populate('medicine');
    return res.json(populated);
  } catch (error) {
    console.error('Update Inventory Item Error:', error);
    return res.status(400).json({ message: 'Error updating inventory item' });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (Pharmacy Owner)
const deleteInventoryItem = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy profile not found' });
    }

    const deleted = await Inventory.findOneAndDelete({
      _id: req.params.id,
      pharmacy: pharmacy._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Item not found in your inventory' });
    }

    return res.json({ message: 'Medicine removed from inventory' });
  } catch (error) {
    console.error('Delete Inventory Error:', error);
    return res.status(500).json({ message: 'Error deleting inventory item' });
  }
};

module.exports = {
  getMyInventory,
  upsertInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
};
