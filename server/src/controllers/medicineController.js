const { z } = require('zod');
const Medicine = require('../models/Medicine');
const Inventory = require('../models/Inventory');
const Pharmacy = require('../models/Pharmacy');

// @desc    Get all medicines with search, filter, and pharmacy availability summary
// @route   GET /api/medicines
// @access  Public
const getMedicines = async (req, res) => {
  try {
    const { search, category, prescriptionRequired, form, sort, page = 1, limit = 50 } = req.query;

    const query = {};

    // Search query (matches name or genericName or manufacturer)
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { genericName: regex }, { manufacturer: regex }];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Prescription required filter
    if (prescriptionRequired !== undefined && prescriptionRequired !== 'All') {
      query.prescriptionRequired = prescriptionRequired === 'true';
    }

    // Form filter (Tablet, Syrup, etc.)
    if (form && form !== 'All') {
      query.form = form;
    }

    // Sorting
    let sortOption = { name: 1 };
    if (sort === 'mrp-low') sortOption = { mrp: 1 };
    if (sort === 'mrp-high') sortOption = { mrp: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Medicine.countDocuments(query);
    const medicines = await Medicine.find(query).sort(sortOption).skip(skip).limit(Number(limit));

    // Live pharmacy availability stats
    const medicineIds = medicines.map((m) => m._id);
    const inventories = await Inventory.find({
      medicine: { $in: medicineIds },
      isAvailable: true,
      stock: { $gt: 0 },
    }).populate('pharmacy', 'name city');

    const medicinesWithStats = medicines.map((med) => {
      const medInventory = inventories.filter(
        (inv) => inv.medicine.toString() === med._id.toString()
      );

      const availablePharmaciesCount = medInventory.length;
      const lowestPrice =
        availablePharmaciesCount > 0
          ? Math.min(...medInventory.map((inv) => inv.price))
          : med.mrp;

      return {
        ...med.toObject(),
        availablePharmaciesCount,
        lowestPrice,
        inStock: availablePharmaciesCount > 0,
      };
    });

    return res.json({
      medicines: medicinesWithStats,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      total,
    });
  } catch (error) {
    console.error('Get Medicines Error:', error);
    return res.status(500).json({ message: 'Error retrieving medicines' });
  }
};

// @desc    Get single medicine details + complete pharmacy comparison table
// @route   GET /api/medicines/:id
// @access  Public
const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    // Find all pharmacies stocking this medicine
    const inventories = await Inventory.find({ medicine: medicine._id })
      .populate('pharmacy', 'name address city state pincode phone rating openingHours')
      .sort({ price: 1 });

    const pharmacyComparisons = inventories
      .filter((inv) => inv.pharmacy !== null)
      .map((inv) => ({
        inventoryId: inv._id,
        pharmacyId: inv.pharmacy._id,
        pharmacyName: inv.pharmacy.name,
        address: `${inv.pharmacy.address}, ${inv.pharmacy.city}, ${inv.pharmacy.pincode}`,
        city: inv.pharmacy.city,
        phone: inv.pharmacy.phone,
        rating: inv.pharmacy.rating,
        openingHours: inv.pharmacy.openingHours,
        price: inv.price,
        mrp: medicine.mrp,
        discountPercent:
          medicine.mrp > inv.price
            ? Math.round(((medicine.mrp - inv.price) / medicine.mrp) * 100)
            : 0,
        stock: inv.stock,
        isAvailable: inv.isAvailable && inv.stock > 0,
        expiryDate: inv.expiryDate,
      }));

    const availablePrices = pharmacyComparisons
      .filter((p) => p.isAvailable)
      .map((p) => p.price);

    const lowestPrice = availablePrices.length > 0 ? Math.min(...availablePrices) : medicine.mrp;
    const highestPrice = availablePrices.length > 0 ? Math.max(...availablePrices) : medicine.mrp;
    const maxDiscount =
      medicine.mrp > lowestPrice
        ? Math.round(((medicine.mrp - lowestPrice) / medicine.mrp) * 100)
        : 0;

    return res.json({
      ...medicine.toObject(),
      pharmacies: pharmacyComparisons,
      lowestPrice,
      highestPrice,
      maxDiscount,
      totalPharmaciesAvailable: availablePrices.length,
    });
  } catch (error) {
    console.error('Get Medicine By Id Error:', error);
    return res.status(500).json({ message: 'Error retrieving medicine details' });
  }
};

// @desc    Get categories with counts
// @route   GET /api/medicines/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = [
      'Pain Relief & Fever',
      'Antibiotics',
      'Diabetes Care',
      'Cardiovascular & BP',
      'Gastrointestinal & Antacid',
      'Respiratory & Allergy',
      'Vitamins & Supplements',
      'Dermatology & Skin',
      'Other',
    ];

    const counts = await Medicine.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id] = c.count;
    });

    const categoryList = categories.map((cat) => ({
      name: cat,
      count: countMap[cat] || 0,
    }));

    return res.json(categoryList);
  } catch (error) {
    console.error('Get Categories Error:', error);
    return res.status(500).json({ message: 'Error retrieving categories' });
  }
};

// @desc    Create new medicine & automatically map to partner pharmacies
// @route   POST /api/medicines
// @access  Public / Authenticated
const createMedicine = async (req, res) => {
  try {
    const {
      name,
      genericName,
      category,
      manufacturer,
      dosage,
      form,
      mrp,
      description,
      prescriptionRequired,
      usageInstructions,
      sideEffects,
      image,
    } = req.body;

    if (!name || !genericName || !mrp) {
      return res.status(400).json({ message: 'Medicine name, generic name, and MRP are required' });
    }

    const defaultImages = {
      'Pain Relief & Fever': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      'Antibiotics': 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
      'Diabetes Care': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
      'Cardiovascular & BP': 'https://images.unsplash.com/photo-1576073719676-aa955fc6b889?w=600&auto=format&fit=crop&q=80',
      'Gastrointestinal & Antacid': 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80',
      'Respiratory & Allergy': 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&auto=format&fit=crop&q=80',
      'Vitamins & Supplements': 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80',
      'Dermatology & Skin': 'https://images.unsplash.com/photo-1583912267670-6575ad362e3b?w=600&auto=format&fit=crop&q=80',
      'Other': 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&auto=format&fit=crop&q=80',
    };

    const chosenImage = image && image.trim() !== '' ? image.trim() : (defaultImages[category] || defaultImages['Other']);

    const medicine = await Medicine.create({
      name,
      genericName,
      category: category || 'Other',
      manufacturer: manufacturer || 'Standard Pharmaceuticals',
      dosage: dosage || '500mg',
      form: form || 'Tablet',
      mrp: Number(mrp),
      description: description || `Prescribed medication for ${category || 'healthcare'}. Consult physician for guidance.`,
      prescriptionRequired: prescriptionRequired === true || prescriptionRequired === 'true',
      usageInstructions: usageInstructions || 'Take as advised by your physician or pharmacist.',
      sideEffects: sideEffects || 'Consult doctor if symptoms persist.',
      image: chosenImage,
    });

    // Auto-create inventory listings in existing partner pharmacies so it's immediately available
    const pharmacies = await Pharmacy.find({});
    if (pharmacies.length > 0) {
      const discountFactors = [0.85, 0.90, 0.88, 0.92];
      const inventoryDocs = pharmacies.map((pharmacy, idx) => {
        const factor = discountFactors[idx % discountFactors.length];
        const sellingPrice = Math.max(5, Math.round(Number(mrp) * factor));
        return {
          pharmacy: pharmacy._id,
          medicine: medicine._id,
          price: sellingPrice,
          stock: 25 + (idx * 5),
          isAvailable: true,
          batchNumber: `BAT-2026-${Date.now().toString().slice(-4)}-${idx}`,
          expiryDate: new Date('2027-10-25'),
        };
      });

      await Inventory.insertMany(inventoryDocs);
    }

    return res.status(201).json(medicine);
  } catch (error) {
    console.error('Create Medicine Error:', error);
    return res.status(400).json({ message: error.message || 'Error creating medicine' });
  }
};

module.exports = {
  getMedicines,
  getMedicineById,
  getCategories,
  createMedicine,
};
