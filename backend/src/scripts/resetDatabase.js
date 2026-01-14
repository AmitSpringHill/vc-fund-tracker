const fs = require('fs');
const path = require('path');

// Script to reset the database
// This will delete the database file and let it be recreated on next server start

const dbPath = path.join(__dirname, '../../database/vc_tracker.db');
const dbShmPath = path.join(__dirname, '../../database/vc_tracker.db-shm');
const dbWalPath = path.join(__dirname, '../../database/vc_tracker.db-wal');

try {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Deleted database file');
  }

  if (fs.existsSync(dbShmPath)) {
    fs.unlinkSync(dbShmPath);
    console.log('Deleted database-shm file');
  }

  if (fs.existsSync(dbWalPath)) {
    fs.unlinkSync(dbWalPath);
    console.log('Deleted database-wal file');
  }

  console.log('Database reset complete. It will be recreated on next server start.');
} catch (error) {
  console.error('Error resetting database:', error);
  process.exit(1);
}
