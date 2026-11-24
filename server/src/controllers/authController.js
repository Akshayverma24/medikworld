const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');

// JWT Generator helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'medfinder_super_secret_jwt_key_2026', {
    expiresIn: '30d',
  });
};

// Zod validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'pharmacy', 'admin']).optional().default('user'),
  phone: z.string().optional().default(''),
  address: z.string().optional().default(''),
  // Optional pharmacy fields when registering as pharmacy
  pharmacyName: z.string().optional(),
  licenseNumber: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  openingHours: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required'),
});

// @desc    Register a new user (or pharmacy owner)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password, role, phone, address } = validatedData;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      phone: phone || '',
      address: address || '',
    });

    let pharmacy = null;

    // If pharmacy role, create pharmacy profile
    if (user.role === 'pharmacy') {
      pharmacy = await Pharmacy.create({
        owner: user._id,
        name: validatedData.pharmacyName || `${user.name}'s Pharmacy`,
        licenseNumber: validatedData.licenseNumber || `DL-${Date.now().toString().slice(-6)}`,
        phone: phone || '9876543210',
        email: email,
        address: address || 'Main Road Market',
        city: validatedData.city || 'Central City',
        state: validatedData.state || 'State',
        pincode: validatedData.pincode || '110001',
        openingHours: validatedData.openingHours || '9:00 AM - 10:00 PM',
      });
    }

    const token = generateToken(user._id);

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      pharmacy: pharmacy ? { _id: pharmacy._id, name: pharmacy.name } : null,
      token,
      message: 'Account created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: error.errors[0]?.message || 'Validation error',
        errors: error.errors,
      });
    }
    console.error('Register Error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    let pharmacy = null;
    if (user.role === 'pharmacy') {
      pharmacy = await Pharmacy.findOne({ owner: user._id });
    }

    const token = generateToken(user._id);

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      pharmacy: pharmacy ? { _id: pharmacy._id, name: pharmacy.name } : null,
      token,
      message: 'Logged in successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0]?.message || 'Validation error' });
    }
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get user profile & info
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let pharmacy = null;
    if (user.role === 'pharmacy') {
      pharmacy = await Pharmacy.findOne({ owner: user._id });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      pharmacy: pharmacy ? { _id: pharmacy._id, name: pharmacy.name, city: pharmacy.city } : null,
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  registerSchema,
  loginSchema,
};
