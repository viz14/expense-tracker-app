import {
  createExpense,
  getExpensesByUser,
  getAllExpenses,
  getPendingExpensesForApprover,
  getExpenseById,
  updateExpenseStatus,
  addApproval,
  getApprovalsByExpense,
  updateApprovalStatus,
  checkAllApprovalsComplete
} from '../models/Expense.js';
import { findUserById, getAllUsers, getApprovalRules } from '../models/User.js';

const determineApprovers = (amount, userId) => {
  const approvers = [];
  const user = findUserById(userId);

  if (user.managerId) {
    approvers.push(user.managerId);
  }

  const allUsers = getAllUsers();
  const financeUsers = allUsers.filter(u => u.role === 'Manager' && u.id !== user.managerId);
  if (financeUsers.length > 0) {
    approvers.push(financeUsers[0].id);
  }

  const adminUsers = allUsers.filter(u => u.role === 'Admin');
  if (adminUsers.length > 0 && amount > 1000) {
    approvers.push(adminUsers[0].id);
  }

  return [...new Set(approvers)];
};

export const submitExpense = async (req, res) => {
  try {
    const { amount, currency, convertedAmount, category, description, vendor, date, receiptUrl } = req.body;
    const userId = req.userId;

    if (!amount || !category || !date) {
      return res.status(400).json({ message: 'Amount, category, and date are required' });
    }

    const approvers = determineApprovers(parseFloat(amount), userId);
    const approvalFlow = JSON.stringify(approvers);

    const result = createExpense(
      userId,
      amount,
      currency || 'USD',
      convertedAmount || amount,
      category,
      description,
      vendor,
      date,
      approvalFlow,
      receiptUrl
    );

    const expenseId = result.lastInsertRowid;

    approvers.forEach(approverId => {
      addApproval(expenseId, approverId);
    });

    res.status(201).json({
      message: 'Expense submitted successfully',
      expenseId,
      approvers
    });
  } catch (error) {
    console.error('Submit expense error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getExpenses = (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    let expenses;

    if (userRole === 'Admin') {
      expenses = getAllExpenses();
    } else if (userRole === 'Manager') {
      const ownExpenses = getExpensesByUser(userId);
      const pendingApprovals = getPendingExpensesForApprover(userId);

      const expenseMap = new Map();
      [...ownExpenses, ...pendingApprovals].forEach(exp => {
        if (!expenseMap.has(exp.id)) {
          expenseMap.set(exp.id, exp);
        }
      });
      expenses = Array.from(expenseMap.values());
    } else {
      expenses = getExpensesByUser(userId);
    }

    const expensesWithApprovals = expenses.map(expense => {
      const approvals = getApprovalsByExpense(expense.id);
      return { ...expense, approvals };
    });

    res.status(200).json(expensesWithApprovals);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const approveExpense = (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    const approverId = req.userId;

    const expense = getExpenseById(parseInt(id));
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    updateApprovalStatus(parseInt(id), approverId, 'Approved', comments);

    const approvalStatus = checkAllApprovalsComplete(parseInt(id));
    const rules = getApprovalRules();

    let finalStatus = 'Pending';

    if (approvalStatus.rejected > 0) {
      finalStatus = 'Rejected';
    } else if (approvalStatus.total > 0) {
      const percentageApproved = (approvalStatus.approved / approvalStatus.total) * 100;

      let ruleMatched = false;
      for (const rule of rules) {
        if (rule.ruleType === 'percentage' && percentageApproved >= rule.percentageRequired) {
          finalStatus = 'Approved';
          ruleMatched = true;
          break;
        } else if (rule.ruleType === 'specific' && approvalStatus.approved > 0) {
          const approvals = getApprovalsByExpense(parseInt(id));
          const specificApproved = approvals.some(a => a.approverId === rule.specificApproverId && a.status === 'Approved');
          if (specificApproved) {
            finalStatus = 'Approved';
            ruleMatched = true;
            break;
          }
        }
      }

      if (!ruleMatched && approvalStatus.approved === approvalStatus.total) {
        finalStatus = 'Approved';
      }
    }

    updateExpenseStatus(parseInt(id), finalStatus);

    res.status(200).json({
      message: 'Expense approved successfully',
      status: finalStatus
    });
  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const rejectExpense = (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;
    const approverId = req.userId;

    const expense = getExpenseById(parseInt(id));
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    updateApprovalStatus(parseInt(id), approverId, 'Rejected', comments);
    updateExpenseStatus(parseInt(id), 'Rejected');

    res.status(200).json({
      message: 'Expense rejected successfully',
      status: 'Rejected'
    });
  } catch (error) {
    console.error('Reject expense error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
