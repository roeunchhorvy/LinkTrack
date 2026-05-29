const express = require('express');
const { getSummary, getUrlAnalytics } = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/summary', getSummary);
router.get('/url/:id', getUrlAnalytics);

module.exports = router;
