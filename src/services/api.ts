import axios from 'axios';
import { User, Expense, ApprovalRule } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: async (username: string, email: string, password: string, country?: string, defaultCurrency?: string) => {
    const response = await api.post('/auth/signup', { username, email, password, country, defaultCurrency });
    return response.data;
  },

  signin: async (email: string, password: string) => {
    const response = await api.post('/auth/signin', { email, password });
    return response.data;
  },
};

export const userAPI = {
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  createUser: async (userData: {
    username: string;
    email: string;
    password: string;
    role?: string;
    country?: string;
    defaultCurrency?: string;
    managerId?: number;
  }) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  changeUserRole: async (userId: number, role: string) => {
    const response = await api.patch('/users/role', { userId, role });
    return response.data;
  },

  assignManager: async (userId: number, managerId: number | null) => {
    const response = await api.patch('/users/manager', { userId, managerId });
    return response.data;
  },

  getApprovalRules: async (): Promise<ApprovalRule[]> => {
    const response = await api.get('/users/approval-rules');
    return response.data;
  },

  createApprovalRule: async (ruleData: {
    ruleType: string;
    percentageRequired?: number;
    specificApproverId?: number;
    minAmount?: number;
    maxAmount?: number;
  }) => {
    const response = await api.post('/users/approval-rules', ruleData);
    return response.data;
  },

  deleteApprovalRule: async (id: number) => {
    const response = await api.delete(`/users/approval-rules/${id}`);
    return response.data;
  },
};

export const expenseAPI = {
  submitExpense: async (expenseData: {
    amount: number;
    currency?: string;
    convertedAmount?: number;
    category: string;
    description?: string;
    vendor?: string;
    date: string;
    receiptUrl?: string;
  }) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  getExpenses: async (): Promise<Expense[]> => {
    const response = await api.get('/expenses');
    return response.data;
  },

  approveExpense: async (id: number, comments?: string) => {
    const response = await api.patch(`/expenses/${id}/approve`, { comments });
    return response.data;
  },

  rejectExpense: async (id: number, comments?: string) => {
    const response = await api.patch(`/expenses/${id}/reject`, { comments });
    return response.data;
  },
};

export const externalAPI = {
  getCountries: async () => {
    const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
    return response.data;
  },

  convertCurrency: async (from: string, to: string, amount: number) => {
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
    const rate = response.data.rates[to];
    return amount * rate;
  },

  getExchangeRates: async (base: string) => {
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${base}`);
    return response.data.rates;
  },
};

export default api;
