const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Pharmacy name is required'],
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'Drug license number is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
    },
    openingHours: {
      type: String,
      default: '8:30 AM - 10:30 PM (Mon-Sun)',
    },
    rating: {
      type: Number,
      default: 4.6,
      min: 1,
      max: 5,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600&auto=format&fit=crop&q=80',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Pharmacy', pharmacySchema);
