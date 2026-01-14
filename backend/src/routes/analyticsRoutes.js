const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');

router.get('/fund-timeline/:fundId', investmentController.getAnalyticsFundTimeline);
router.get('/portfolio-composition/:quarterId', investmentController.getAnalyticsPortfolioComposition);
router.get('/investment-comparison/:quarterId', investmentController.getAnalyticsInvestmentComparison);

module.exports = router;
