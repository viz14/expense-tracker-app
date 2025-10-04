import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2 } from 'lucide-react';
import { userAPI } from '../services/api';
import { ApprovalRule, User } from '../types';

export const ApprovalRules: React.FC = () => {
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ruleType: 'percentage' as 'percentage' | 'specific' | 'hybrid',
    percentageRequired: 60,
    specificApproverId: 0,
    minAmount: 0,
    maxAmount: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rulesData, usersData] = await Promise.all([
        userAPI.getApprovalRules(),
        userAPI.getAllUsers()
      ]);
      setRules(rulesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userAPI.createApprovalRule({
        ruleType: formData.ruleType,
        percentageRequired: formData.ruleType === 'percentage' || formData.ruleType === 'hybrid'
          ? formData.percentageRequired
          : undefined,
        specificApproverId: formData.ruleType === 'specific' || formData.ruleType === 'hybrid'
          ? formData.specificApproverId
          : undefined,
        minAmount: formData.minAmount || undefined,
        maxAmount: formData.maxAmount || undefined
      });
      await loadData();
      setShowForm(false);
      setFormData({
        ruleType: 'percentage',
        percentageRequired: 60,
        specificApproverId: 0,
        minAmount: 0,
        maxAmount: 0
      });
    } catch (error) {
      console.error('Failed to create rule:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      try {
        await userAPI.deleteApprovalRule(id);
        await loadData();
      } catch (error) {
        console.error('Failed to delete rule:', error);
      }
    }
  };

  const getApproverName = (id?: number) => {
    if (!id) return '-';
    const user = users.find(u => u.id === id);
    return user ? `${user.username} (${user.role})` : '-';
  };

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
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Approval Rules</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>{showForm ? 'Cancel' : 'Add Rule'}</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Approval Rule</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rule Type
              </label>
              <select
                value={formData.ruleType}
                onChange={(e) => setFormData({ ...formData, ruleType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="percentage">Percentage Approval</option>
                <option value="specific">Specific Approver Required</option>
                <option value="hybrid">Hybrid (Both)</option>
              </select>
            </div>

            {(formData.ruleType === 'percentage' || formData.ruleType === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Percentage Required (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.percentageRequired}
                  onChange={(e) => setFormData({ ...formData, percentageRequired: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            {(formData.ruleType === 'specific' || formData.ruleType === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Approver
                </label>
                <select
                  value={formData.specificApproverId}
                  onChange={(e) => setFormData({ ...formData, specificApproverId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="0">Select an approver</option>
                  {users.filter(u => u.role === 'Admin' || u.role === 'Manager').map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Amount (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({ ...formData, minAmount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Amount (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maxAmount}
                  onChange={(e) => setFormData({ ...formData, maxAmount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Rule
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active Rules</h2>
        </div>
        {rules.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No approval rules configured yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rule Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specific Approver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {rule.ruleType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {rule.percentageRequired ? `${rule.percentageRequired}%` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getApproverName(rule.specificApproverId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {rule.minAmount || rule.maxAmount
                          ? `$${rule.minAmount || 0} - $${rule.maxAmount || '∞'}`
                          : 'All amounts'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
