import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, TrendingUp, TrendingDown, Plus, History, CheckCircle, XCircle, Clock } from 'lucide-react';
import { expenseAPI } from '../services/api';
import { Expense } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const data = await expenseAPI.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (expenseId: number) => {
    setActionLoading(expenseId);
    try {
      await expenseAPI.approveExpense(expenseId);
      await loadExpenses();
    } catch (error) {
      console.error('Failed to approve expense:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (expenseId: number) => {
    const comments = prompt('Rejection reason (optional):');
    setActionLoading(expenseId);
    try {
      await expenseAPI.rejectExpense(expenseId, comments || undefined);
      await loadExpenses();
    } catch (error) {
      console.error('Failed to reject expense:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const myExpenses = expenses.filter(e => e.userId === user?.id);
  const pendingApprovals = expenses.filter(e =>
    e.status === 'Pending' &&
    e.approvals?.some(a => a.approverId === user?.id && a.status === 'Pending')
  );

  const totalPending = myExpenses.filter(e => e.status === 'Pending').reduce((sum, e) => sum + e.amount, 0);
  const totalApproved = myExpenses.filter(e => e.status === 'Approved').reduce((sum, e) => sum + e.amount, 0);
  const totalRejected = myExpenses.filter(e => e.status === 'Rejected').reduce((sum, e) => sum + e.amount, 0);

  const stats = [
    {
      title: 'Pending Expenses',
      value: `$${totalPending.toFixed(2)}`,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Approved Expenses',
      value: `$${totalApproved.toFixed(2)}`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Rejected Expenses',
      value: `$${totalRejected.toFixed(2)}`,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.username}!</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/add-entry')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>Submit Expense</span>
          </button>
          <button
            onClick={() => navigate('/history')}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <History size={16} />
            <span>View History</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(user?.role === 'Manager' || user?.role === 'Admin') && pendingApprovals.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Approvals</h2>
          <div className="space-y-4">
            {pendingApprovals.map((expense) => (
              <div key={expense.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{expense.username}</p>
                    <p className="text-sm text-gray-500">{expense.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">${expense.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{expense.currency}</p>
                  </div>
                </div>
                {expense.description && (
                  <p className="text-sm text-gray-600 mb-2">{expense.description}</p>
                )}
                <p className="text-xs text-gray-500 mb-3">Date: {expense.date}</p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApprove(expense.id)}
                    disabled={actionLoading === expense.id}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={16} />
                    <span>{actionLoading === expense.id ? 'Approving...' : 'Approve'}</span>
                  </button>
                  <button
                    onClick={() => handleReject(expense.id)}
                    disabled={actionLoading === expense.id}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    <span>{actionLoading === expense.id ? 'Rejecting...' : 'Reject'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Expenses</h2>
        {myExpenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No expenses yet. Submit your first expense!</p>
            <button
              onClick={() => navigate('/add-entry')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Expense
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myExpenses.slice(0, 5).map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{expense.category}</p>
                  <p className="text-sm text-gray-500">{expense.description || 'No description'}</p>
                  <p className="text-xs text-gray-400">{expense.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${expense.amount.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    expense.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    expense.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {expense.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
