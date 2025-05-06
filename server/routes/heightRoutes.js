// server/routes/heightRoutes.js

const express = require('express');
const { measureHeight, updateHeight } = require('../controllers/heightController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/measure-height', measureHeight);
router.post('/update-height', authMiddleware, updateHeight);

module.exports = router;