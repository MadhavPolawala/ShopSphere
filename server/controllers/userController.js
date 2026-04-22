const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'none',
  secure: true,
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

const buildUserPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  phone: user.phone || '',
  address: user.address || '',
  city: user.city || '',
  postalCode: user.postalCode || '',
  state: user.state || '',
  country: user.country || 'India',
});

const sendUserResponse = (res, user, statusCode = 200) => {
  const token = generateToken(user._id);
  // Set cookie (works for same-domain; ignored cross-domain by browsers)
  res.cookie('token', token, getCookieOptions());
  // Also include token in body so the client can persist it in localStorage
  // This is required for cross-domain deployments (e.g. Netlify + Render)
  res.status(statusCode).json({ ...buildUserPayload(user), token });
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      sendUserResponse(res, user);
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password });
    if (user) {
      sendUserResponse(res, user, 201);
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user missing' });
    }
    const user = await User.findById(req.user._id);
    if (user) {
      res.json(buildUserPayload(user));
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile (phone, address, etc.)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, phone, address, city, postalCode, state, country } = req.body;

    user.name = name || user.name;
    user.phone = phone !== undefined ? phone : user.phone;
    user.address = address !== undefined ? address : user.address;
    user.city = city !== undefined ? city : user.city;
    user.postalCode = postalCode !== undefined ? postalCode : user.postalCode;
    user.state = state !== undefined ? state : user.state;
    user.country = country || user.country;

    const updatedUser = await user.save();
    res.json(buildUserPayload(updatedUser));
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const logoutUser = (req, res) => {
  res.cookie('token', '', {
    ...getCookieOptions(),
    maxAge: 0,
  });
  res.json({ message: 'Logged out successfully' });
};

module.exports = { authUser, registerUser, getUserProfile, updateUserProfile, logoutUser };
