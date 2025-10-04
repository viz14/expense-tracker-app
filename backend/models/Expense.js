import db from './User.js';

db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    convertedAmount REAL,
    category TEXT NOT NULL,
    description TEXT,
    vendor TEXT,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    approvalFlow TEXT,
    receiptUrl TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS expense_approvals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expenseId INTEGER NOT NULL,
    approverId INTEGER NOT NULL,
    status TEXT DEFAULT 'Pending',
    comments TEXT,
    approvedAt TEXT,
    FOREIGN KEY (expenseId) REFERENCES expenses(id),
    FOREIGN KEY (approverId) REFERENCES users(id)
  )
`);

export const createExpense = (userId, amount, currency, convertedAmount, category, description, vendor, date, approvalFlow, receiptUrl) => {
  const stmt = db.prepare(`
    INSERT INTO expenses (userId, amount, currency, convertedAmount, category, description, vendor, date, approvalFlow, receiptUrl)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(userId, amount, currency, convertedAmount, category, description, vendor, date, approvalFlow, receiptUrl);
};

export const getExpensesByUser = (userId) => {
  const stmt = db.prepare(`
    SELECT e.*, u.username, u.email
    FROM expenses e
    JOIN users u ON e.userId = u.id
    WHERE e.userId = ?
    ORDER BY e.createdAt DESC
  `);
  return stmt.all(userId);
};

export const getAllExpenses = () => {
  const stmt = db.prepare(`
    SELECT e.*, u.username, u.email
    FROM expenses e
    JOIN users u ON e.userId = u.id
    ORDER BY e.createdAt DESC
  `);
  return stmt.all();
};

export const getPendingExpensesForApprover = (approverId) => {
  const stmt = db.prepare(`
    SELECT DISTINCT e.*, u.username, u.email
    FROM expenses e
    JOIN users u ON e.userId = u.id
    JOIN expense_approvals ea ON e.id = ea.expenseId
    WHERE ea.approverId = ? AND ea.status = 'Pending'
    ORDER BY e.createdAt DESC
  `);
  return stmt.all(approverId);
};

export const getExpenseById = (id) => {
  const stmt = db.prepare(`
    SELECT e.*, u.username, u.email
    FROM expenses e
    JOIN users u ON e.userId = u.id
    WHERE e.id = ?
  `);
  return stmt.get(id);
};

export const updateExpenseStatus = (id, status) => {
  const stmt = db.prepare('UPDATE expenses SET status = ? WHERE id = ?');
  return stmt.run(status, id);
};

export const addApproval = (expenseId, approverId) => {
  const stmt = db.prepare(`
    INSERT INTO expense_approvals (expenseId, approverId)
    VALUES (?, ?)
  `);
  return stmt.run(expenseId, approverId);
};

export const getApprovalsByExpense = (expenseId) => {
  const stmt = db.prepare(`
    SELECT ea.*, u.username, u.email, u.role
    FROM expense_approvals ea
    JOIN users u ON ea.approverId = u.id
    WHERE ea.expenseId = ?
  `);
  return stmt.all(expenseId);
};

export const updateApprovalStatus = (expenseId, approverId, status, comments) => {
  const stmt = db.prepare(`
    UPDATE expense_approvals
    SET status = ?, comments = ?, approvedAt = CURRENT_TIMESTAMP
    WHERE expenseId = ? AND approverId = ?
  `);
  return stmt.run(status, comments, expenseId, approverId);
};

export const checkAllApprovalsComplete = (expenseId) => {
  const stmt = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected
    FROM expense_approvals
    WHERE expenseId = ?
  `);
  return stmt.get(expenseId);
};
