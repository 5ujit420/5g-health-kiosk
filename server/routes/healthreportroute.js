const express = require('express');
const router = express.Router();
const { sendHealthReport } = require('../controllers/healthReportController');

// Route to send health report
router.post('/getHealthReport', sendHealthReport);

module.exports = router;