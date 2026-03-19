const Visit = require('../models/Visit');
const Bill = require('../models/Bill');

/**
 * GET /api/visits
 * Get all visits, supports ?cow=id, ?owner=id, ?date=YYYY-MM-DD, ?startDate=&endDate=
 */
const getVisits = async (req, res) => {
  try {
    const { cow, owner, date, startDate, endDate } = req.query;
    const query = {};

    if (cow) query.cow = cow;
    if (owner) query.owner = owner;

    // Date filtering
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const ed = new Date(endDate);
        ed.setHours(23, 59, 59, 999);
        query.date.$lte = ed;
      }
    }

    const visits = await Visit.find(query)
      .populate('owner', 'name phone')
      .populate('cow', 'tagNumber breed')
      .sort({ date: -1 });

    res.json({ success: true, count: visits.length, data: visits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/visits/:id
 * Get a single visit
 */
const getVisit = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id)
      .populate('owner', 'name phone address')
      .populate('cow', 'tagNumber breed age gender');
    if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
    res.json({ success: true, data: visit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/visits
 * Create a new visit and auto-generate a bill
 */
const createVisit = async (req, res) => {
  try {
    const { owner, cow, date, symptoms, diagnosis, treatment, medicines, notes, followUpDate,
            consultationFee, medicineCharges, otherCharges } = req.body;

    // Create visit
    const visit = await Visit.create({
      owner, cow, date, symptoms, diagnosis, treatment, medicines, notes, followUpDate,
    });

    // Auto-generate bill for this visit
    const bill = await Bill.create({
      visit: visit._id,
      owner,
      cow,
      consultationFee: consultationFee || 0,
      medicineCharges: medicineCharges || 0,
      otherCharges: otherCharges || 0,
      date: visit.date,
    });

    // Populate visit for response
    await visit.populate('owner', 'name phone');
    await visit.populate('cow', 'tagNumber breed');

    res.status(201).json({ success: true, data: { visit, bill } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/visits/:id
 * Update a visit
 */
const updateVisit = async (req, res) => {
  try {
    const visit = await Visit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('owner', 'name phone').populate('cow', 'tagNumber breed');
    if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
    res.json({ success: true, data: visit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/visits/:id
 * Delete a visit and its associated bill
 */
const deleteVisit = async (req, res) => {
  try {
    const visit = await Visit.findByIdAndDelete(req.params.id);
    if (!visit) return res.status(404).json({ success: false, message: 'Visit not found' });
    // Delete associated bill
    await Bill.findOneAndDelete({ visit: req.params.id });
    res.json({ success: true, message: 'Visit deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getVisits, getVisit, createVisit, updateVisit, deleteVisit };
