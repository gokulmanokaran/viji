const express = require('express');
const router = express.Router();
const { getBills, getBill, updateBill, getDashboardStats } = require('../controllers/billController');

router.get('/dashboard', getDashboardStats);
router.route('/').get(getBills);
router.route('/:id').get(getBill).put(updateBill);

module.exports = router;
