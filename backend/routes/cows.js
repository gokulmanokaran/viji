const express = require('express');
const router = express.Router();
const { getCows, getCow, createCow, updateCow, deleteCow } = require('../controllers/cowController');

router.route('/').get(getCows).post(createCow);
router.route('/:id').get(getCow).put(updateCow).delete(deleteCow);

module.exports = router;
