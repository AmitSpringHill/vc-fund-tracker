const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');
const { validate, investmentSchema, bulkInvestmentsSchema } = require('../utils/validators');

router.get('/', investmentController.getAllInvestments);
router.get('/:id', investmentController.getInvestmentById);
router.post('/', validate(investmentSchema), investmentController.createInvestment);
router.post('/bulk', validate(bulkInvestmentsSchema), investmentController.createBulkInvestments);
router.put('/:id', investmentController.updateInvestment);
router.delete('/:id', investmentController.deleteInvestment);

router.get('/company/:company_name/history', investmentController.getCompanyHistory);

module.exports = router;
