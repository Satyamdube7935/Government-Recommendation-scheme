const express = require('express');
const {
  getRecommendations,
  checkSchemeEligibility,
} = require('../controllers/recommendController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getRecommendations);
router.get('/check/:schemeId', protect, checkSchemeEligibility);

module.exports = router;
