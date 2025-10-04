import jwt from 'jsonwebtoken';
import { findUserById } from '../models/User.js';

export const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

export const isAdmin = (req, res, next) => {
  const user = findUserById(req.userId);

  if (!user || user.role !== 'Admin') {
    return res.status(403).json({ message: 'Require Admin role' });
  }

  next();
};

export const isManagerOrAdmin = (req, res, next) => {
  const user = findUserById(req.userId);

  if (!user || (user.role !== 'Manager' && user.role !== 'Admin')) {
    return res.status(403).json({ message: 'Require Manager or Admin role' });
  }

  next();
};

export const isEmployee = (req, res, next) => {
  const user = findUserById(req.userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  next();
};
