const express = require('express');
const {
  getSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  deleteScheme,
  getCategories,
} = require('../controllers/schemeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/categories/list', getCategories);
router.get('/', getSchemes);
router.get('/:id', getSchemeById);
router.post('/', protect, adminOnly, createScheme);
router.put('/:id', protect, adminOnly, updateScheme);
router.delete('/:id', protect, adminOnly, deleteScheme);

module.exports = router;
