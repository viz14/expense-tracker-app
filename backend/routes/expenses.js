import express from 'express';
import { submitExpense, getExpenses, approveExpense, rejectExpense } from '../controllers/expenseController.js';
import { verifyToken } from '../middleware/authJwt.js';

const router = express.Router();

router.post('/', verifyToken, submitExpense);
router.get('/', verifyToken, getExpenses);
router.patch('/:id/approve', verifyToken, approveExpense);
router.patch('/:id/reject', verifyToken, rejectExpense);

export default router;
