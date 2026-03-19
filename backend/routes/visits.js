const express = require('express');
const router = express.Router();
const { getVisits, getVisit, createVisit, updateVisit, deleteVisit } = require('../controllers/visitController');

router.route('/').get(getVisits).post(createVisit);
router.route('/:id').get(getVisit).put(updateVisit).delete(deleteVisit);

module.exports = router;
