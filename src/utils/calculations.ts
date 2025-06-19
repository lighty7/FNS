import { EMI, Transaction, FinancialSummary } from '../types';

export const calculateRemainingMonths = (emi: EMI): number => {
  const startDate = new Date(emi.startDate);
  const currentDate = new Date();
  const monthsPassed = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
                       (currentDate.getMonth() - startDate.getMonth());
  return Math.max(0, emi.duration - monthsPassed);
};

export const calculateFinancialSummary = (
  emis: EMI[], 
  transactions: Transaction[], 
  monthlyIncome: number
): FinancialSummary => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Filter transactions for current month
  const currentMonthTransactions = transactions.filter(txn => {
    const txnDate = new Date(txn.date);
    return txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear;
  });

  const monthlyIncomeTxns = currentMonthTransactions
    .filter(txn => txn.type === 'income')
    .reduce((sum, txn) => sum + txn.amount, 0);

  const monthlyExpenseTxns = currentMonthTransactions
    .filter(txn => txn.type === 'expense')
    .reduce((sum, txn) => sum + txn.amount, 0);

  const totalIncome = monthlyIncome + monthlyIncomeTxns;
  const totalEMIs = emis.reduce((sum, emi) => sum + emi.emiAmount, 0);
  const totalExpenses = monthlyExpenseTxns + totalEMIs;
  const remainingBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (remainingBalance / totalIncome) * 100 : 0;

  return {
    totalIncome,
    totalExpenses,
    totalEMIs,
    remainingBalance,
    savingsRate,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getNextDueDate = (dueDay: number): Date => {
  const today = new Date();
  const nextDue = new Date(today.getFullYear(), today.getMonth(), dueDay);
  
  if (nextDue <= today) {
    nextDue.setMonth(nextDue.getMonth() + 1);
  }
  
  return nextDue;
};

export const exportData = (data: any): void => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};