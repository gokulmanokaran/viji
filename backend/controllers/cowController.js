const Cow = require('../models/Cow');

/**
 * GET /api/cows
 * Get all cows (optionally filtered by owner)
 */
const getCows = async (req, res) => {
  try {
    const { owner } = req.query;
    const query = owner ? { owner } : {};
    const cows = await Cow.find(query)
      .populate('owner', 'name phone')
      .sort({ createdAt: -1 })
      .lean(); // Optimize: bypass mongoose hydration
    res.json({ success: true, count: cows.length, data: cows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/cows/:id
 * Get a single cow
 */
const getCow = async (req, res) => {
  try {
    const cow = await Cow.findById(req.params.id)
      .populate('owner', 'name phone')
      .lean(); // Optimize
    if (!cow) return res.status(404).json({ success: false, message: 'Cow not found' });
    res.json({ success: true, data: cow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/cows
 * Create a new cow
 */
const createCow = async (req, res) => {
  try {
    const { tagNumber, breed, age, gender, owner, notes } = req.body;
    const cow = await Cow.create({ tagNumber, breed, age, gender, owner, notes });
    await cow.populate('owner', 'name phone');
    res.status(201).json({ success: true, data: cow });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Tag number already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/cows/:id
 * Update a cow
 */
const updateCow = async (req, res) => {
  try {
    const cow = await Cow.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('owner', 'name phone');
    if (!cow) return res.status(404).json({ success: false, message: 'Cow not found' });
    res.json({ success: true, data: cow });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/cows/:id
 * Delete a cow
 */
const deleteCow = async (req, res) => {
  try {
    const cow = await Cow.findByIdAndDelete(req.params.id);
    if (!cow) return res.status(404).json({ success: false, message: 'Cow not found' });
    res.json({ success: true, message: 'Cow deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCows, getCow, createCow, updateCow, deleteCow };
