const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const profileSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true },
    age: { type: Number, min: 0, max: 120 },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: '',
    },
    category: {
      type: String,
      enum: ['general', 'obc', 'sc', 'st', 'ews', ''],
      default: '',
    },
    annualIncome: { type: Number, min: 0, default: 0 },
    occupation: {
      type: String,
      enum: [
        'student',
        'farmer',
        'unemployed',
        'salaried',
        'self-employed',
        'homemaker',
        'retired',
        'other',
        '',
      ],
      default: '',
    },
    education: {
      type: String,
      enum: [
        'none',
        'primary',
        'secondary',
        'higher-secondary',
        'graduate',
        'postgraduate',
        'diploma',
        '',
      ],
      default: '',
    },
    state: { type: String, trim: true, default: '' },
    areaType: {
      type: String,
      enum: ['rural', 'urban', ''],
      default: '',
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'widowed', 'divorced', ''],
      default: '',
    },
    disability: { type: Boolean, default: false },
    isBPL: { type: Boolean, default: false },
    hasBankAccount: { type: Boolean, default: true },
    aadhaarLinked: { type: Boolean, default: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['citizen', 'admin'], default: 'citizen' },
    profile: { type: profileSchema, default: () => ({}) },
    profileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async function matchPassword(entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    profile: this.profile,
    profileComplete: this.profileComplete,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
