import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plus, DollarSign, Calendar, Tag, Upload, Scan } from 'lucide-react';
import { expenseAPI, externalAPI } from '../services/api';
import Tesseract from 'tesseract.js';

export const AddEntry: React.FC = () => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(user?.defaultCurrency || 'USD');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [currencies, setCurrencies] = useState<string[]>(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();

  const categories = [
    'Food & Dining',
    'Transportation',
    'Accommodation',
    'Entertainment',
    'Office Supplies',
    'Travel',
    'Equipment',
    'Software & Services',
    'Marketing',
    'Other'
  ];

  useEffect(() => {
    if (user?.defaultCurrency) {
      setCurrency(user.defaultCurrency);
    }
  }, [user]);

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptFile(file);
    setScanning(true);
    setError('');

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => console.log(m)
      });

      const text = result.data.text;

      const amountMatch = text.match(/(?:total|amount|sum)[\s:]*\$?(\d+\.?\d*)/i);
      if (amountMatch) {
        setAmount(amountMatch[1]);
      }

      const dateMatch = text.match(/(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/);
      if (dateMatch) {
        const parsedDate = new Date(dateMatch[1]);
        if (!isNaN(parsedDate.getTime())) {
          setDate(parsedDate.toISOString().split('T')[0]);
        }
      }

      const lines = text.split('\n').filter(line => line.trim().length > 3);
      if (lines.length > 0) {
        setVendor(lines[0].trim());
      }

    } catch (err) {
      console.error('OCR failed:', err);
      setError('Failed to scan receipt. Please enter details manually.');
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!amount.trim() || !category.trim() || !date.trim()) {
      setError('Amount, category, and date are required');
      setLoading(false);
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a positive number');
      setLoading(false);
      return;
    }

    try {
      let convertedAmount = numAmount;
      if (currency !== user?.defaultCurrency) {
        convertedAmount = await externalAPI.convertCurrency(
          currency,
          user?.defaultCurrency || 'USD',
          numAmount
        );
      }

      await expenseAPI.submitExpense({
        amount: numAmount,
        currency,
        convertedAmount,
        category,
        description,
        vendor,
        date,
        receiptUrl: receiptFile ? receiptFile.name : undefined
      });

      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to submit expense:', err);
      setError('Failed to submit expense. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Plus className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Submit Expense</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {scanning && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
            Scanning receipt... This may take a few moments.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Receipt Upload (OCR)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleReceiptUpload}
                className="hidden"
                id="receipt-upload"
                disabled={scanning}
              />
              <label
                htmlFor="receipt-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                {scanning ? (
                  <Scan className="h-12 w-12 text-blue-500 animate-pulse" />
                ) : (
                  <Upload className="h-12 w-12 text-gray-400" />
                )}
                <span className="text-sm text-gray-600">
                  {receiptFile ? receiptFile.name : 'Click to upload receipt image'}
                </span>
                <span className="text-xs text-gray-500">
                  Auto-fill fields from receipt
                </span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {currencies.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 mb-2">
              Vendor
            </label>
            <input
              type="text"
              id="vendor"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter vendor name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter expense description"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading || scanning}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Expense'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
