const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
      index: true,
    },
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      default: 0,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    batchNumber: {
      type: String,
      default: 'MF-2026-A1',
    },
    expiryDate: {
      type: Date,
      default: () => new Date(+new Date() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: a pharmacy lists a medicine once in inventory
inventorySchema.index({ pharmacy: 1, medicine: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
