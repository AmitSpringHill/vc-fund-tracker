const express = require('express');
const router = express.Router();
const fundController = require('../controllers/fundController');
const { validate, fundSchema } = require('../utils/validators');

router.get('/', fundController.getAllFunds);
router.get('/:id', fundController.getFundById);
router.get('/:id/quarters', fundController.getFundWithQuarters);
router.post('/', validate(fundSchema), fundController.createFund);
router.put('/:id', validate(fundSchema), fundController.updateFund);
router.delete('/:id', fundController.deleteFund);

module.exports = router;
