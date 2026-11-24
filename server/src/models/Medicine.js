const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      index: true,
    },
    genericName: {
      type: String,
      required: [true, 'Generic/Chemical name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Pain Relief & Fever',
        'Antibiotics',
        'Diabetes Care',
        'Cardiovascular & BP',
        'Gastrointestinal & Antacid',
        'Respiratory & Allergy',
        'Vitamins & Supplements',
        'Dermatology & Skin',
        'Other',
      ],
      default: 'Other',
    },
    manufacturer: {
      type: String,
      required: [true, 'Manufacturer is required'],
      trim: true,
    },
    dosage: {
      type: String,
      required: [true, 'Dosage strength is required (e.g. 500mg, 10ml)'],
      trim: true,
    },
    form: {
      type: String,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Inhaler'],
      default: 'Tablet',
    },
    mrp: {
      type: Number,
      required: [true, 'Standard MRP is required'],
      min: 0,
    },
    description: {
      type: String,
      default: '',
    },
    prescriptionRequired: {
      type: Boolean,
      default: false,
    },
    usageInstructions: {
      type: String,
      default: 'Take as directed by a healthcare professional.',
    },
    sideEffects: {
      type: String,
      default: 'Consult doctor if unusual symptoms persist.',
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    },
  },
  {
    timestamps: true,
  }
);

// Text search index for fast and flexible searches
medicineSchema.index({ name: 'text', genericName: 'text', manufacturer: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);
