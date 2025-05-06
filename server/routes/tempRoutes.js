// server/routes/temperatureRoutes.js

const express = require('express');
const { getTemperature, updateTemp } = require('../controllers/tempController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/measure-temperature', getTemperature);
router.post('/update-temprature', authMiddleware, updateTemp);

module.exports = router;
