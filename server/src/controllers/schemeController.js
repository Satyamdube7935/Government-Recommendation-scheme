const Scheme = require('../models/Scheme');

const getSchemes = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [schemes, total] = await Promise.all([
      Scheme.find(filter).sort({ name: 1 }).skip(skip).limit(Number(limit)),
      Scheme.countDocuments(filter),
    ]);

    res.json({
      schemes,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }
    res.json({ scheme });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createScheme = async (req, res) => {
  try {
    const scheme = await Scheme.create(req.body);
    res.status(201).json({ scheme });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }
    res.json({ scheme });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }
    res.json({ message: 'Scheme deactivated', scheme });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategories = async (_req, res) => {
  const categories = [
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
  ];
  res.json({ categories });
};

module.exports = {
  getSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  deleteScheme,
  getCategories,
};
