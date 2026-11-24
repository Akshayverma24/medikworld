const Pharmacy = require('../models/Pharmacy');
const Inventory = require('../models/Inventory');

// @desc    Get all registered pharmacies with optional search
// @route   GET /api/pharmacies
// @access  Public
const getPharmacies = async (req, res) => {
  try {
    const { search, city } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { address: regex }, { pincode: regex }, { city: regex }];
    }

    if (city && city !== 'All') {
      query.city = new RegExp(city.trim(), 'i');
    }

    const pharmacies = await Pharmacy.find(query).sort({ rating: -1, name: 1 });

    // Aggregate inventory count for each pharmacy
    const pharmacyIds = pharmacies.map((p) => p._id);
    const inventoryCounts = await Inventory.aggregate([
      { $match: { pharmacy: { $in: pharmacyIds }, isAvailable: true, stock: { $gt: 0 } } },
      { $group: { _id: '$pharmacy', totalMedicines: { $sum: 1 } } },
    ]);

    const countMap = {};
    inventoryCounts.forEach((item) => {
      countMap[item._id.toString()] = item.totalMedicines;
    });

    const pharmaciesWithCounts = pharmacies.map((p) => ({
      ...p.toObject(),
      totalMedicinesInStock: countMap[p._id.toString()] || 0,
    }));

    return res.json(pharmaciesWithCounts);
  } catch (error) {
    console.error('Get Pharmacies Error:', error);
    return res.status(500).json({ message: 'Error retrieving pharmacies' });
  }
};

// @desc    Get single pharmacy details and its medicine catalog
// @route   GET /api/pharmacies/:id
// @access  Public
const getPharmacyById = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    // Get inventory of this pharmacy populated with medicine details
    const inventory = await Inventory.find({ pharmacy: pharmacy._id })
      .populate('medicine')
      .sort({ 'medicine.name': 1 });

    const medicines = inventory
      .filter((inv) => inv.medicine !== null)
      .map((inv) => ({
        inventoryId: inv._id,
        medicineId: inv.medicine._id,
        name: inv.medicine.name,
        genericName: inv.medicine.genericName,
        category: inv.medicine.category,
        dosage: inv.medicine.dosage,
        form: inv.medicine.form,
        manufacturer: inv.medicine.manufacturer,
        mrp: inv.medicine.mrp,
        price: inv.price,
        stock: inv.stock,
        isAvailable: inv.isAvailable && inv.stock > 0,
        prescriptionRequired: inv.medicine.prescriptionRequired,
        image: inv.medicine.image,
      }));

    return res.json({
      pharmacy,
      medicines,
      totalListed: medicines.length,
      inStockCount: medicines.filter((m) => m.isAvailable).length,
    });
  } catch (error) {
    console.error('Get Pharmacy By Id Error:', error);
    return res.status(500).json({ message: 'Error retrieving pharmacy profile' });
  }
};

// @desc    Update pharmacy details (for pharmacy owner)
// @route   PUT /api/pharmacies/:id
// @access  Private (Pharmacy Owner / Admin)
const updatePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    // Verify ownership
    if (pharmacy.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this pharmacy' });
    }

    const updated = await Pharmacy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.json(updated);
  } catch (error) {
    console.error('Update Pharmacy Error:', error);
    return res.status(400).json({ message: error.message || 'Error updating pharmacy' });
  }
};

module.exports = {
  getPharmacies,
  getPharmacyById,
  updatePharmacy,
};
