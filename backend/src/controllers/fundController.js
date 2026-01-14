const Fund = require('../models/fund');

async function getAllFunds(req, res, next) {
  try {
    const funds = Fund.getAll();
    res.json({ success: true, data: funds });
  } catch (error) {
    next(error);
  }
}

async function getFundById(req, res, next) {
  try {
    const { id } = req.params;
    const fund = Fund.getById(id);

    if (!fund) {
      return res.status(404).json({
        success: false,
        error: 'Fund not found'
      });
    }

    res.json({ success: true, data: fund });
  } catch (error) {
    next(error);
  }
}

async function createFund(req, res, next) {
  try {
    const { name, description } = req.body;
    const fund = Fund.create(name, description);
    res.status(201).json({ success: true, data: fund });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        success: false,
        error: 'A fund with this name already exists'
      });
    }
    next(error);
  }
}

async function updateFund(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existing = Fund.getById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Fund not found'
      });
    }

    const fund = Fund.update(id, name, description);
    res.json({ success: true, data: fund });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        success: false,
        error: 'A fund with this name already exists'
      });
    }
    next(error);
  }
}

async function deleteFund(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = Fund.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Fund not found'
      });
    }

    res.json({ success: true, message: 'Fund deleted successfully' });
  } catch (error) {
    next(error);
  }
}

async function getFundWithQuarters(req, res, next) {
  try {
    const { id } = req.params;
    const fund = Fund.getWithQuarters(id);

    if (!fund) {
      return res.status(404).json({
        success: false,
        error: 'Fund not found'
      });
    }

    res.json({ success: true, data: fund });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllFunds,
  getFundById,
  createFund,
  updateFund,
  deleteFund,
  getFundWithQuarters
};
