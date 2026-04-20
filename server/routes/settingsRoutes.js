const express = require('express');
const router = express.Router();
const { getSortMode, setSortMode } = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/sort', getSortMode);
router.put('/sort', protect, admin, setSortMode);

module.exports = router;
