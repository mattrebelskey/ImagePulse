const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'imagepulse.db'));

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS trends (
    id TEXT PRIMARY KEY,
    title TEXT,
    traffic TEXT,
    date TEXT
  );
  
  CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trend_title TEXT,
    prompt_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS favorite_niches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT UNIQUE,
    category TEXT,
    keywords_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS favorite_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trend_title TEXT,
    product_type TEXT,
    prompts_json TEXT,
    tags_json TEXT,
    titles_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;
