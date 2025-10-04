import {
  findUserById,
  getAllUsers,
  createUser,
  updateUserRole,
  updateUserManager,
  createApprovalRule,
  getApprovalRules,
  deleteApprovalRule
} from '../models/User.js';

export const getCurrentUser = (req, res) => {
  try {
    const userId = req.userId;
    const user = findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getUsers = (req, res) => {
  try {
    const users = getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const createNewUser = (req, res) => {
  try {
    const { username, email, password, role, country, defaultCurrency, managerId } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    const userId = createUser(
      username,
      email,
      password,
      role || 'Employee',
      country,
      defaultCurrency || 'USD',
      managerId
    );

    const user = findUserById(userId);

    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const changeUserRole = (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ message: 'User ID and role are required' });
    }

    updateUserRole(userId, role);

    res.status(200).json({
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Change user role error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const assignManager = (req, res) => {
  try {
    const { userId, managerId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    updateUserManager(userId, managerId);

    res.status(200).json({
      message: 'Manager assigned successfully'
    });
  } catch (error) {
    console.error('Assign manager error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const addApprovalRule = (req, res) => {
  try {
    const { ruleType, percentageRequired, specificApproverId, minAmount, maxAmount } = req.body;

    if (!ruleType) {
      return res.status(400).json({ message: 'Rule type is required' });
    }

    const result = createApprovalRule(
      ruleType,
      percentageRequired || null,
      specificApproverId || null,
      minAmount || null,
      maxAmount || null
    );

    res.status(201).json({
      message: 'Approval rule created successfully',
      ruleId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Add approval rule error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const fetchApprovalRules = (req, res) => {
  try {
    const rules = getApprovalRules();
    res.status(200).json(rules);
  } catch (error) {
    console.error('Fetch approval rules error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const removeApprovalRule = (req, res) => {
  try {
    const { id } = req.params;

    deleteApprovalRule(parseInt(id));

    res.status(200).json({
      message: 'Approval rule deleted successfully'
    });
  } catch (error) {
    console.error('Remove approval rule error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
