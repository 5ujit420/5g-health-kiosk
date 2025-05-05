// server/routes/weightRoutes.js

const express = require('express');
const { getWeight } = require('../controllers/weightController');

const router = express.Router();

router.get('/measure-weight', getWeight);

module.exports = router;
