const db = require('../config/database');

class Quarter {
  static getAll(filters = {}) {
    let query = 'SELECT * FROM quarters WHERE 1=1';
    const params = [];

    if (filters.fund_id) {
      query += ' AND fund_id = ?';
      params.push(filters.fund_id);
    }

    if (filters.year) {
      query += ' AND year = ?';
      params.push(filters.year);
    }

    query += ' ORDER BY year DESC, quarter DESC';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  static getById(id) {
    const stmt = db.prepare('SELECT * FROM quarters WHERE id = ?');
    return stmt.get(id);
  }

  static create(fundId, year, quarter, quarterDate, pdfFilename = null, pdfPath = null) {
    const stmt = db.prepare(`
      INSERT INTO quarters (fund_id, year, quarter, quarter_date, pdf_filename, pdf_path)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(fundId, year, quarter, quarterDate, pdfFilename, pdfPath);
    return this.getById(result.lastInsertRowid);
  }

  static update(id, data) {
    const { year, quarter, quarterDate, pdfFilename, pdfPath } = data;
    const stmt = db.prepare(`
      UPDATE quarters
      SET year = COALESCE(?, year),
          quarter = COALESCE(?, quarter),
          quarter_date = COALESCE(?, quarter_date),
          pdf_filename = COALESCE(?, pdf_filename),
          pdf_path = COALESCE(?, pdf_path)
      WHERE id = ?
    `);
    stmt.run(year, quarter, quarterDate, pdfFilename, pdfPath, id);
    return this.getById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM quarters WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static getWithInvestments(id) {
    const quarter = this.getById(id);
    if (!quarter) return null;

    const investmentsStmt = db.prepare(`
      SELECT * FROM investments
      WHERE quarter_id = ?
      ORDER BY current_value DESC
    `);
    quarter.investments = investmentsStmt.all(id);

    return quarter;
  }

  static exists(fundId, year, quarter) {
    const stmt = db.prepare(`
      SELECT id FROM quarters
      WHERE fund_id = ? AND year = ? AND quarter = ?
    `);
    return stmt.get(fundId, year, quarter);
  }
}

module.exports = Quarter;
