import express from 'express';
import {
  getCurrentUser,
  getUsers,
  createNewUser,
  changeUserRole,
  assignManager,
  addApprovalRule,
  fetchApprovalRules,
  removeApprovalRule
} from '../controllers/userController.js';
import { verifyToken, isAdmin } from '../middleware/authJwt.js';

const router = express.Router();

router.get('/me', verifyToken, getCurrentUser);
router.get('/', verifyToken, getUsers);
router.post('/', verifyToken, isAdmin, createNewUser);
router.patch('/role', verifyToken, isAdmin, changeUserRole);
router.patch('/manager', verifyToken, isAdmin, assignManager);
router.post('/approval-rules', verifyToken, isAdmin, addApprovalRule);
router.get('/approval-rules', verifyToken, fetchApprovalRules);
router.delete('/approval-rules/:id', verifyToken, isAdmin, removeApprovalRule);

export default router;
