export interface EMI {
  id: string;
  name: string;
  loanAmount: number;
  emiAmount: number;
  dueDate: number; // day of month (1-31)
  startDate: string;
  duration: number; // in months
  remainingMonths: number;
  interestRate?: number;
  category: 'home' | 'car' | 'personal' | 'education' | 'other';
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  isRecurring?: boolean;
}

export interface MonthlyBudget {
  income: number;
  fixedExpenses: number;
  variableExpenses: number;
  savings: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  totalEMIs: number;
  remainingBalance: number;
  savingsRate: number;
}