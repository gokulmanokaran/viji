const Owner = require('../models/Owner');

/**
 * GET /api/owners
 * Get all owners (supports ?search=phone query)
 */
const getOwners = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      // Search by phone or name
      query = {
        $or: [
          { phone: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const owners = await Owner.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: owners.length, data: owners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/owners/:id
 * Get a single owner
 */
const getOwner = async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id);
    if (!owner) return res.status(404).json({ success: false, message: 'Owner not found' });
    res.json({ success: true, data: owner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/owners
 * Create a new owner
 */
const createOwner = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const owner = await Owner.create({ name, phone, address });
    res.status(201).json({ success: true, data: owner });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'An owner with this info already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/owners/:id
 * Update an owner
 */
const updateOwner = async (req, res) => {
  try {
    const owner = await Owner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!owner) return res.status(404).json({ success: false, message: 'Owner not found' });
    res.json({ success: true, data: owner });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/owners/:id
 * Delete an owner
 */
const deleteOwner = async (req, res) => {
  try {
    const owner = await Owner.findByIdAndDelete(req.params.id);
    if (!owner) return res.status(404).json({ success: false, message: 'Owner not found' });
    res.json({ success: true, message: 'Owner deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getOwners, getOwner, createOwner, updateOwner, deleteOwner };
