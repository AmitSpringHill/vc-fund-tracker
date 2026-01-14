const db = require('../config/database');

class Investment {
  static getAll(filters = {}) {
    let query = 'SELECT * FROM investment_details WHERE 1=1';
    const params = [];

    if (filters.quarter_id) {
      query += ' AND quarter_id = ?';
      params.push(filters.quarter_id);
    }

    if (filters.fund_id) {
      query += ' AND fund_id = ?';
      params.push(filters.fund_id);
    }

    if (filters.company_name) {
      query += ' AND company_name LIKE ?';
      params.push(`%${filters.company_name}%`);
    }

    query += ' ORDER BY current_value DESC';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  static getById(id) {
    const stmt = db.prepare('SELECT * FROM investment_details WHERE id = ?');
    return stmt.get(id);
  }

  static create(quarterId, companyName, investmentDate, cost, currentValue, notes = null) {
    const stmt = db.prepare(`
      INSERT INTO investments (quarter_id, company_name, investment_date, cost, current_value, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(quarterId, companyName, investmentDate, cost, currentValue, notes);
    return this.getById(result.lastInsertRowid);
  }

  static createBulk(investments) {
    const insertStmt = db.prepare(`
      INSERT INTO investments (quarter_id, company_name, investment_date, cost, current_value, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((investmentList) => {
      for (const inv of investmentList) {
        insertStmt.run(
          inv.quarter_id,
          inv.company_name,
          inv.investment_date,
          inv.cost,
          inv.current_value,
          inv.notes || null
        );
      }
    });

    insertMany(investments);
    return { success: true, count: investments.length };
  }

  static update(id, data) {
    const { companyName, investmentDate, cost, currentValue, notes } = data;
    const stmt = db.prepare(`
      UPDATE investments
      SET company_name = COALESCE(?, company_name),
          investment_date = COALESCE(?, investment_date),
          cost = COALESCE(?, cost),
          current_value = COALESCE(?, current_value),
          notes = COALESCE(?, notes)
      WHERE id = ?
    `);
    stmt.run(companyName, investmentDate, cost, currentValue, notes, id);
    return this.getById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM investments WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static getByQuarterId(quarterId) {
    const stmt = db.prepare(`
      SELECT * FROM investment_details
      WHERE quarter_id = ?
      ORDER BY current_value DESC
    `);
    return stmt.all(quarterId);
  }

  static getCompanyHistory(companyName, fundId = null) {
    let query = `
      SELECT * FROM investment_details
      WHERE company_name = ?
    `;
    const params = [companyName];

    if (fundId) {
      query += ' AND fund_id = ?';
      params.push(fundId);
    }

    query += ' ORDER BY quarter_date ASC';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }
}

module.exports = Investment;
