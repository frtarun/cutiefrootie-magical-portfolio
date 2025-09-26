const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const rateLimit = require('express-rate-limit');

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});

// Apply rate limiting to all routes
router.use(limiter);

// Routes
router.get('/showcase-projects', apiController.getShowcaseProjects);
router.get('/tutorial-videos', apiController.getTutorialVideos);
router.post('/contact', apiController.handleContact);

module.exports = router;