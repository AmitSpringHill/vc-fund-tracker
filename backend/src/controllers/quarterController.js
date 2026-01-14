const Quarter = require('../models/quarter');

async function getAllQuarters(req, res, next) {
  try {
    const { fund_id, year } = req.query;
    const filters = {};

    if (fund_id) filters.fund_id = fund_id;
    if (year) filters.year = year;

    const quarters = Quarter.getAll(filters);
    res.json({ success: true, data: quarters });
  } catch (error) {
    next(error);
  }
}

async function getQuarterById(req, res, next) {
  try {
    const { id } = req.params;
    const quarter = Quarter.getById(id);

    if (!quarter) {
      return res.status(404).json({
        success: false,
        error: 'Quarter not found'
      });
    }

    res.json({ success: true, data: quarter });
  } catch (error) {
    next(error);
  }
}

async function createQuarter(req, res, next) {
  try {
    const { fund_id, year, quarter, quarter_date, pdf_filename, pdf_path } = req.body;

    const existing = Quarter.exists(fund_id, year, quarter);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `Quarter ${quarter} of ${year} already exists for this fund`
      });
    }

    const newQuarter = Quarter.create(fund_id, year, quarter, quarter_date, pdf_filename, pdf_path);
    res.status(201).json({ success: true, data: newQuarter });
  } catch (error) {
    next(error);
  }
}

async function updateQuarter(req, res, next) {
  try {
    const { id } = req.params;

    const existing = Quarter.getById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Quarter not found'
      });
    }

    const quarter = Quarter.update(id, req.body);
    res.json({ success: true, data: quarter });
  } catch (error) {
    next(error);
  }
}

async function deleteQuarter(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = Quarter.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Quarter not found'
      });
    }

    res.json({ success: true, message: 'Quarter deleted successfully' });
  } catch (error) {
    next(error);
  }
}

async function getQuarterWithInvestments(req, res, next) {
  try {
    const { id } = req.params;
    const quarter = Quarter.getWithInvestments(id);

    if (!quarter) {
      return res.status(404).json({
        success: false,
        error: 'Quarter not found'
      });
    }

    res.json({ success: true, data: quarter });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllQuarters,
  getQuarterById,
  createQuarter,
  updateQuarter,
  deleteQuarter,
  getQuarterWithInvestments
};
