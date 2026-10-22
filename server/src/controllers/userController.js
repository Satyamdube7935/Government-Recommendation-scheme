const User = require('../models/User');

const isProfileComplete = (profile) => {
  if (!profile) return false;
  return Boolean(
    profile.fullName &&
      profile.age != null &&
      profile.gender &&
      profile.category &&
      profile.annualIncome != null &&
      profile.occupation &&
      profile.education &&
      profile.state &&
      profile.areaType
  );
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allowed = [
      'fullName',
      'age',
      'gender',
      'category',
      'annualIncome',
      'occupation',
      'education',
      'state',
      'areaType',
      'maritalStatus',
      'disability',
      'isBPL',
      'hasBankAccount',
      'aadhaarLinked',
    ];

    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        user.profile[key] = req.body[key];
      }
    });

    if (req.body.name) {
      user.name = req.body.name;
    }

    user.profileComplete = isProfileComplete(user.profile);
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.toSafeObject(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { updateProfile, getProfile };
