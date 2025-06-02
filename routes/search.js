const express = require('express');
const router = express.Router();
const { searchHandler } = require('../controllers/listings.js');

router.post('/search', searchHandler);

module.exports = router;
