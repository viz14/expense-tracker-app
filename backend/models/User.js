import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '../expenses.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'Employee',
    country TEXT,
    defaultCurrency TEXT DEFAULT 'USD',
    managerId INTEGER,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (managerId) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS approval_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ruleType TEXT NOT NULL,
    percentageRequired REAL,
    specificApproverId INTEGER,
    minAmount REAL,
    maxAmount REAL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (specificApproverId) REFERENCES users(id)
  )
`);

export const createUser = (username, email, password, role = 'Employee', country = null, defaultCurrency = 'USD', managerId = null) => {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const stmt = db.prepare(`
    INSERT INTO users (username, email, password, role, country, defaultCurrency, managerId)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(username, email, hashedPassword, role, country, defaultCurrency, managerId);
  return result.lastInsertRowid;
};

export const findUserByEmail = (email) => {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
};

export const findUserById = (id) => {
  const stmt = db.prepare('SELECT id, username, email, role, country, defaultCurrency, managerId, createdAt FROM users WHERE id = ?');
  return stmt.get(id);
};

export const findUserByUsername = (username) => {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username);
};

export const getAllUsers = () => {
  const stmt = db.prepare('SELECT id, username, email, role, country, defaultCurrency, managerId, createdAt FROM users');
  return stmt.all();
};

export const updateUserRole = (userId, role) => {
  const stmt = db.prepare('UPDATE users SET role = ? WHERE id = ?');
  return stmt.run(role, userId);
};

export const updateUserManager = (userId, managerId) => {
  const stmt = db.prepare('UPDATE users SET managerId = ? WHERE id = ?');
  return stmt.run(managerId, userId);
};

export const comparePassword = (plainPassword, hashedPassword) => {
  return bcrypt.compareSync(plainPassword, hashedPassword);
};

export const getUserCount = () => {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
  return stmt.get().count;
};

export const createApprovalRule = (ruleType, percentageRequired, specificApproverId, minAmount, maxAmount) => {
  const stmt = db.prepare(`
    INSERT INTO approval_rules (ruleType, percentageRequired, specificApproverId, minAmount, maxAmount)
    VALUES (?, ?, ?, ?, ?)
  `);
  return stmt.run(ruleType, percentageRequired, specificApproverId, minAmount, maxAmount);
};

export const getApprovalRules = () => {
  const stmt = db.prepare('SELECT * FROM approval_rules');
  return stmt.all();
};

export const deleteApprovalRule = (id) => {
  const stmt = db.prepare('DELETE FROM approval_rules WHERE id = ?');
  return stmt.run(id);
};

export default db;
