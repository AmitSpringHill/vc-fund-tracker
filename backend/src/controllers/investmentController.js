const Investment = require('../models/investment');

async function getAllInvestments(req, res, next) {
  try {
    const { quarter_id, fund_id, company_name } = req.query;
    const filters = {};

    if (quarter_id) filters.quarter_id = quarter_id;
    if (fund_id) filters.fund_id = fund_id;
    if (company_name) filters.company_name = company_name;

    const investments = Investment.getAll(filters);
    res.json({ success: true, data: investments });
  } catch (error) {
    next(error);
  }
}

async function getInvestmentById(req, res, next) {
  try {
    const { id } = req.params;
    const investment = Investment.getById(id);

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    res.json({ success: true, data: investment });
  } catch (error) {
    next(error);
  }
}

async function createInvestment(req, res, next) {
  try {
    const { quarter_id, company_name, investment_date, cost, current_value, notes } = req.body;
    const investment = Investment.create(
      quarter_id,
      company_name,
      investment_date,
      cost,
      current_value,
      notes
    );
    res.status(201).json({ success: true, data: investment });
  } catch (error) {
    next(error);
  }
}

async function createBulkInvestments(req, res, next) {
  try {
    const { quarter_id, investments } = req.body;

    const investmentsWithQuarterId = investments.map(inv => ({
      ...inv,
      quarter_id
    }));

    const result = Investment.createBulk(investmentsWithQuarterId);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function updateInvestment(req, res, next) {
  try {
    const { id } = req.params;

    const existing = Investment.getById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    const { company_name, investment_date, cost, current_value, notes } = req.body;
    const investment = Investment.update(id, {
      companyName: company_name,
      investmentDate: investment_date,
      cost,
      currentValue: current_value,
      notes
    });

    res.json({ success: true, data: investment });
  } catch (error) {
    next(error);
  }
}

async function deleteInvestment(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = Investment.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    res.json({ success: true, message: 'Investment deleted successfully' });
  } catch (error) {
    next(error);
  }
}

async function getCompanyHistory(req, res, next) {
  try {
    const { company_name } = req.params;
    const { fund_id } = req.query;

    const history = Investment.getCompanyHistory(company_name, fund_id);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
}

async function getAnalyticsFundTimeline(req, res, next) {
  try {
    const { fundId } = req.params;
    const db = require('../config/database');

    const stmt = db.prepare(`
      SELECT
        q.quarter_date,
        q.year,
        q.quarter,
        SUM(i.cost) as total_cost,
        SUM(i.current_value) as total_value,
        COUNT(i.id) as count,
        CASE
          WHEN SUM(i.cost) > 0 THEN SUM(i.current_value) / SUM(i.cost)
          ELSE 0
        END as multiple
      FROM quarters q
      LEFT JOIN investments i ON q.id = i.quarter_id
      WHERE q.fund_id = ?
      GROUP BY q.id
      ORDER BY q.year ASC, q.quarter ASC
    `);

    const timeline = stmt.all(fundId);
    res.json({ success: true, data: timeline });
  } catch (error) {
    next(error);
  }
}

async function getAnalyticsPortfolioComposition(req, res, next) {
  try {
    const { quarterId } = req.params;
    const db = require('../config/database');

    const stmt = db.prepare(`
      SELECT
        i.company_name,
        i.current_value,
        (i.current_value * 100.0 / SUM(i.current_value) OVER ()) as percentage
      FROM investments i
      WHERE i.quarter_id = ?
      ORDER BY i.current_value DESC
    `);

    const composition = stmt.all(quarterId);
    res.json({ success: true, data: composition });
  } catch (error) {
    next(error);
  }
}

async function getAnalyticsInvestmentComparison(req, res, next) {
  try {
    const { quarterId } = req.params;
    const investments = Investment.getByQuarterId(quarterId);
    res.json({ success: true, data: investments });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllInvestments,
  getInvestmentById,
  createInvestment,
  createBulkInvestments,
  updateInvestment,
  deleteInvestment,
  getCompanyHistory,
  getAnalyticsFundTimeline,
  getAnalyticsPortfolioComposition,
  getAnalyticsInvestmentComparison
};
