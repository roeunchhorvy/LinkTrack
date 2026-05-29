const express = require('express');
const { handleRedirect } = require('../controllers/redirectController');

const router = express.Router();

// Public route — no auth required. Mounted at the root in app.js so the URL
// looks like http://localhost:5000/abc1234
router.get('/:shortCode', handleRedirect);

module.exports = router;
