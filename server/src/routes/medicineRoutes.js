const express = require('express');
const router = express.Router();
const {
  getMedicines,
  getMedicineById,
  getCategories,
  createMedicine,
} = require('../controllers/medicineController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/', getMedicines);
router.get('/categories', getCategories);
router.get('/:id', getMedicineById);
router.post('/', optionalAuth, createMedicine);

module.exports = router;
