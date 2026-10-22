const mongoose = require('mongoose');

const eligibilitySchema = new mongoose.Schema(
  {
    minAge: { type: Number, default: null },
    maxAge: { type: Number, default: null },
    genders: { type: [String], default: [] },
    categories: { type: [String], default: [] },
    maxAnnualIncome: { type: Number, default: null },
    occupations: { type: [String], default: [] },
    educationLevels: { type: [String], default: [] },
    states: { type: [String], default: [] },
    areaTypes: { type: [String], default: [] },
    maritalStatuses: { type: [String], default: [] },
    requiresDisability: { type: Boolean, default: false },
    requiresBPL: { type: Boolean, default: false },
    requiresBankAccount: { type: Boolean, default: false },
    requiresAadhaar: { type: Boolean, default: false },
  },
  { _id: false }
);

const schemeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    shortName: { type: String, trim: true },
    description: { type: String, required: true },
    department: { type: String, required: true },
    benefits: { type: String, required: true },
    documentsRequired: { type: [String], default: [] },
    applicationProcess: { type: String, default: '' },
    officialLink: { type: String, default: '' },
    category: {
      type: String,
      enum: [
        'education',
        'employment',
        'health',
        'agriculture',
        'housing',
        'women',
        'senior-citizen',
        'financial',
        'social-welfare',
        'skill-development',
      ],
      required: true,
    },
    tags: { type: [String], default: [] },
    eligibility: { type: eligibilitySchema, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scheme', schemeSchema);
