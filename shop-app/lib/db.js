const Database = require("better-sqlite3");
const path = require("path");
const { runMigrations } = require("./migrate");

const DB_PATH = path.join(process.cwd(), "..", "shop.db");

let _db = null;

function getDb() {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    runMigrations(_db);
  }
  return _db;
}

function all(sql, params = []) {
  return getDb().prepare(sql).all(...params);
}

function get(sql, params = []) {
  return getDb().prepare(sql).get(...params);
}

function run(sql, params = []) {
  return getDb().prepare(sql).run(...params);
}

function transaction(fn) {
  return getDb().transaction(fn)();
}

module.exports = { getDb, all, get, run, transaction };
