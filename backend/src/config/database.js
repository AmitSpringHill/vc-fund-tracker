const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../database/vc_tracker.db');

// Check if RESET_DB environment variable is set
if (process.env.RESET_DB === 'true') {
  console.log('RESET_DB is true - deleting existing database and uploads...');
  try {
    // Delete database files
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    if (fs.existsSync(dbPath + '-shm')) fs.unlinkSync(dbPath + '-shm');
    if (fs.existsSync(dbPath + '-wal')) fs.unlinkSync(dbPath + '-wal');
    console.log('Database files deleted successfully');

    // Delete all uploaded PDF files
    const uploadsPath = path.join(__dirname, '../../uploads');
    if (fs.existsSync(uploadsPath)) {
      const files = fs.readdirSync(uploadsPath);
      let deletedCount = 0;
      files.forEach(file => {
        if (file !== '.gitkeep') {
          const filePath = path.join(uploadsPath, file);
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      });
      console.log(`Deleted ${deletedCount} uploaded file(s)`);
    }
  } catch (error) {
    console.error('Error deleting files:', error);
  }
}

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

function initializeDatabase() {
  const schema = `
    -- Funds table
    CREATE TABLE IF NOT EXISTS funds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Quarters table
    CREATE TABLE IF NOT EXISTS quarters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fund_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      quarter INTEGER NOT NULL CHECK(quarter >= 1 AND quarter <= 4),
      quarter_date TEXT NOT NULL,
      pdf_filename TEXT,
      pdf_path TEXT,
      capital_commitments REAL DEFAULT 0,
      management_fees REAL DEFAULT 0,
      operating_costs REAL DEFAULT 0,
      formation_costs REAL DEFAULT 0,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (fund_id) REFERENCES funds(id) ON DELETE CASCADE,
      UNIQUE(fund_id, year, quarter)
    );

    -- Investments table
    CREATE TABLE IF NOT EXISTS investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quarter_id INTEGER NOT NULL,
      company_name TEXT NOT NULL,
      investment_date TEXT,
      cost REAL NOT NULL CHECK(cost >= 0),
      current_value REAL NOT NULL CHECK(current_value >= 0),
      multiple REAL GENERATED ALWAYS AS (
        CASE
          WHEN cost > 0 THEN current_value / cost
          ELSE 0
        END
      ) STORED,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quarter_id) REFERENCES quarters(id) ON DELETE CASCADE
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_quarters_fund ON quarters(fund_id);
    CREATE INDEX IF NOT EXISTS idx_investments_quarter ON investments(quarter_id);
    CREATE INDEX IF NOT EXISTS idx_quarters_date ON quarters(quarter_date);
    CREATE INDEX IF NOT EXISTS idx_investments_company ON investments(company_name);

    -- View for easy querying
    CREATE VIEW IF NOT EXISTS investment_details AS
    SELECT
      i.id,
      i.quarter_id,
      i.company_name,
      i.investment_date,
      i.cost,
      i.current_value,
      i.multiple,
      i.notes,
      i.created_at,
      q.year,
      q.quarter,
      q.quarter_date,
      f.id as fund_id,
      f.name as fund_name
    FROM investments i
    JOIN quarters q ON i.quarter_id = q.id
    JOIN funds f ON q.fund_id = f.id;
  `;

  db.exec(schema);

  // Add migration for existing databases - add new expense tracking columns if they don't exist
  try {
    const tableInfo = db.pragma('table_info(quarters)');
    const columnNames = tableInfo.map(col => col.name);

    if (!columnNames.includes('capital_commitments')) {
      db.exec('ALTER TABLE quarters ADD COLUMN capital_commitments REAL DEFAULT 0');
      console.log('Added capital_commitments column to quarters table');
    }
    if (!columnNames.includes('management_fees')) {
      db.exec('ALTER TABLE quarters ADD COLUMN management_fees REAL DEFAULT 0');
      console.log('Added management_fees column to quarters table');
    }
    if (!columnNames.includes('operating_costs')) {
      db.exec('ALTER TABLE quarters ADD COLUMN operating_costs REAL DEFAULT 0');
      console.log('Added operating_costs column to quarters table');
    }
    if (!columnNames.includes('formation_costs')) {
      db.exec('ALTER TABLE quarters ADD COLUMN formation_costs REAL DEFAULT 0');
      console.log('Added formation_costs column to quarters table');
    }
  } catch (error) {
    console.error('Error running migrations:', error);
  }

  console.log('Database initialized successfully');
}

initializeDatabase();

module.exports = db;
