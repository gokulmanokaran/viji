const Bill = require('../models/Bill');
const Visit = require('../models/Visit');

/**
 * GET /api/billing
 * Get all bills with optional date filtering
 */
const getBills = async (req, res) => {
  try {
    const { date, startDate, endDate, owner } = req.query;
    const query = {};

    if (owner) query.owner = owner;

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

    const bills = await Bill.find(query)
      .populate('owner', 'name phone')
      .populate('cow', 'tagNumber breed')
      .populate('visit', 'symptoms diagnosis treatment date')
      .sort({ date: -1 });

    res.json({ success: true, count: bills.length, data: bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/billing/:id
 * Get a single bill
 */
const getBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('owner', 'name phone address')
      .populate('cow', 'tagNumber breed age')
      .populate('visit');
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/billing/:id
 * Update a bill (mark paid, update amounts)
 */
const updateBill = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('owner', 'name phone').populate('cow', 'tagNumber breed');
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, data: bill });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/billing/dashboard
 * Get today's visit count and revenue stats
 */
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Today's visits
    const todayVisits = await Visit.countDocuments({ date: { $gte: today, $lte: todayEnd } });

    // Today's revenue
    const todayBills = await Bill.find({ date: { $gte: today, $lte: todayEnd } });
    const todayRevenue = todayBills.reduce((sum, b) => sum + b.totalAmount, 0);

    // Total revenue (all time)
    const allBills = await Bill.find({});
    const totalRevenue = allBills.reduce((sum, b) => sum + b.totalAmount, 0);

    // Recent visits (last 5)
    const recentVisits = await Visit.find({})
      .populate('owner', 'name phone')
      .populate('cow', 'tagNumber breed')
      .sort({ date: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        todayVisits,
        todayRevenue,
        totalRevenue,
        recentVisits,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getBills, getBill, updateBill, getDashboardStats };
