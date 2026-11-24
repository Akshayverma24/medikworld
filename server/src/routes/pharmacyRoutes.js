const express = require('express');
const router = express.Router();
const {
  getPharmacies,
  getPharmacyById,
  updatePharmacy,
} = require('../controllers/pharmacyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getPharmacies);
router.get('/:id', getPharmacyById);
router.put('/:id', protect, authorize('pharmacy', 'admin'), updatePharmacy);

module.exports = router;
