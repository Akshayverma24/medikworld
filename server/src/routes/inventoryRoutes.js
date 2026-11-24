const express = require('express');
const router = express.Router();
const {
  getMyInventory,
  upsertInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('pharmacy', 'admin'));

router.get('/my', getMyInventory);
router.post('/', upsertInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);

module.exports = router;
