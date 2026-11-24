const express = require('express');
const router = express.Router();
const {
  createReservation,
  getUserReservations,
  getPharmacyReservations,
  updateReservationStatus,
  getPlatformStats,
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', getPlatformStats);

// Protected routes
router.use(protect);

router.post('/', createReservation);
router.get('/user', getUserReservations);
router.get('/pharmacy', authorize('pharmacy', 'admin'), getPharmacyReservations);
router.put('/:id/status', updateReservationStatus);

module.exports = router;
