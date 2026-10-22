const Scheme = require('../models/Scheme');
const User = require('../models/User');
const { recommendSchemes, evaluateScheme } = require('../services/eligibilityEngine');

const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.profileComplete) {
      return res.status(400).json({
        message: 'Please complete your profile before getting recommendations',
        profileComplete: false,
      });
    }

    const { category, includeIneligible, limit } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;

    const schemes = await Scheme.find(filter);
    const recommendations = recommendSchemes(user.profile, schemes, {
      includeIneligible: includeIneligible === 'true',
      limit: Number(limit) || 20,
    });

    const summary = {
      totalSchemesChecked: schemes.length,
      highlyEligible: recommendations.filter((r) => r.eligibilityStatus === 'highly_eligible').length,
      eligible: recommendations.filter((r) => r.eligibilityStatus === 'eligible').length,
      partiallyEligible: recommendations.filter((r) => r.eligibilityStatus === 'partially_eligible')
        .length,
      returned: recommendations.length,
    };

    res.json({
      profile: user.profile,
      summary,
      recommendations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkSchemeEligibility = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const scheme = await Scheme.findById(req.params.schemeId);

    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    const result = evaluateScheme(user.profile, scheme);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRecommendations, checkSchemeEligibility };
