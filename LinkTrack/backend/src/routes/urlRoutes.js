const express = require('express');
const {
  createUrl,
  listUrls,
  getUrl,
  updateUrl,
  deleteUrl,
} = require('../controllers/urlController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Every URL route requires authentication
router.use(authMiddleware);

router.route('/').post(createUrl).get(listUrls);
router.route('/:id').get(getUrl).put(updateUrl).delete(deleteUrl);

module.exports = router;
