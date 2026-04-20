const express = require('express');
const router = express.Router();
const { authUser, registerUser, getUserProfile, updateUserProfile, logoutUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.head('/healthCheck', (req, res) => {
  res.status(200).end();
});

module.exports = router;

