export interface User {
  id: number;
  username: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Employee';
  country?: string;
  defaultCurrency: string;
  managerId?: number;
  createdAt: string;
}

export interface Expense {
  id: number;
  userId: number;
  username?: string;
  email?: string;
  amount: number;
  currency: string;
  convertedAmount?: number;
  category: string;
  description?: string;
  vendor?: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvalFlow?: string;
  receiptUrl?: string;
  createdAt: string;
  approvals?: Approval[];
}

export interface Approval {
  id: number;
  expenseId: number;
  approverId: number;
  username: string;
  email: string;
  role: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  comments?: string;
  approvedAt?: string;
}

export interface ApprovalRule {
  id: number;
  ruleType: 'percentage' | 'specific' | 'hybrid';
  percentageRequired?: number;
  specificApproverId?: number;
  minAmount?: number;
  maxAmount?: number;
  createdAt: string;
}

export interface Country {
  name: {
    common: string;
  };
  currencies?: {
    [key: string]: {
      name: string;
      symbol: string;
    };
  };
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, country?: string, defaultCurrency?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}
