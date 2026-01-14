const db = require('../config/database');

class Fund {
  static getAll() {
    const stmt = db.prepare('SELECT * FROM funds ORDER BY created_at DESC');
    return stmt.all();
  }

  static getById(id) {
    const stmt = db.prepare('SELECT * FROM funds WHERE id = ?');
    return stmt.get(id);
  }

  static create(name, description = null) {
    const stmt = db.prepare('INSERT INTO funds (name, description) VALUES (?, ?)');
    const result = stmt.run(name, description);
    return this.getById(result.lastInsertRowid);
  }

  static update(id, name, description) {
    const stmt = db.prepare(`
      UPDATE funds
      SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(name, description, id);
    return this.getById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM funds WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static getWithQuarters(id) {
    const fund = this.getById(id);
    if (!fund) return null;

    const quartersStmt = db.prepare(`
      SELECT * FROM quarters
      WHERE fund_id = ?
      ORDER BY year DESC, quarter DESC
    `);
    fund.quarters = quartersStmt.all(id);

    return fund;
  }
}

module.exports = Fund;
