const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dbFile = path.join(__dirname, '../data/app.db');
fs.mkdirSync(path.dirname(dbFile), { recursive: true });

const db = new Database(dbFile);

module.exports = db;
