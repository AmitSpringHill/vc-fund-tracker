const express = require('express');
const router = express.Router();
const quarterController = require('../controllers/quarterController');
const { validate, quarterSchema } = require('../utils/validators');

router.get('/', quarterController.getAllQuarters);
router.get('/:id', quarterController.getQuarterById);
router.get('/:id/investments', quarterController.getQuarterWithInvestments);
router.post('/', validate(quarterSchema), quarterController.createQuarter);
router.put('/:id', quarterController.updateQuarter);
router.delete('/:id', quarterController.deleteQuarter);

module.exports = router;
