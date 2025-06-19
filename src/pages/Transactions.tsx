import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Transaction } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/calculations';

const Transactions: React.FC = () => {
  const { state, addTransaction, updateTransactionAction, deleteTransactionAction } = useFinance();
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as Transaction['type'],
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const incomeCategories = [
    'Salary', 'Freelance', 'Business', 'Investment', 'Rental', 'Other Income'
  ];

  const expenseCategories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities',
    'Healthcare', 'Education', 'Travel', 'Insurance', 'Other Expense'
  ];

  const allCategories = [...new Set([...incomeCategories, ...expenseCategories])];

  const filteredTransactions = useMemo(() => {
    let filtered = state.transactions;

    if (searchTerm) {
      filtered = filtered.filter(txn =>
        txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(txn => txn.type === filterType);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(txn => txn.category === filterCategory);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.transactions, searchTerm, filterType, filterCategory]);

  const monthlyStats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthTransactions = state.transactions.filter(txn => {
      const txnDate = new Date(txn.date);
      return txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear;
    });

    const income = currentMonthTransactions
      .filter(txn => txn.type === 'income')
      .reduce((sum, txn) => sum + txn.amount, 0);

    const expenses = currentMonthTransactions
      .filter(txn => txn.type === 'expense')
      .reduce((sum, txn) => sum + txn.amount, 0);

    return { income, expenses, balance: income - expenses };
  }, [state.transactions]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.date) newErrors.date = 'Date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const transactionData: Omit<Transaction, 'id'> = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category.trim(),
        description: formData.description.trim(),
        date: formData.date,
      };

      if (editingTransaction) {
        await updateTransactionAction({ ...transactionData, id: editingTransaction.id });
        setEditingTransaction(null);
      } else {
        await addTransaction(transactionData);
        setIsAddingTransaction(false);
      }

      resetForm();
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      type: 'expense',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setErrors({});
  };

  const handleEdit = (transaction: Transaction) => {
    setFormData({
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      description: transaction.description,
      date: transaction.date,
    });
    setEditingTransaction(transaction);
    setIsAddingTransaction(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransactionAction(id);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const handleCancel = () => {
    setIsAddingTransaction(false);
    setEditingTransaction(null);
    resetForm();
  };

  const getCategoryOptions = () => {
    const categories = formData.type === 'income' ? incomeCategories : expenseCategories;
    return categories.map(cat => ({ value: cat, label: cat }));
  };

  if (state.loading && state.transactions.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Transactions</h1>
          <p className="text-slate-400">Track your daily income and expenses</p>
        </div>
        {!isAddingTransaction && (
          <Button onClick={() => setIsAddingTransaction(true)} icon={Plus}>
            Add Transaction
          </Button>
        )}
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">This Month Income</p>
              <p className="text-2xl font-bold text-emerald-400">
                {formatCurrency(monthlyStats.income)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-400" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">This Month Expenses</p>
              <p className="text-2xl font-bold text-red-400">
                {formatCurrency(monthlyStats.expenses)}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-400" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Net Balance</p>
              <p className={`text-2xl font-bold ${
                monthlyStats.balance >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {formatCurrency(monthlyStats.balance)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Add/Edit Transaction Form */}
      {isAddingTransaction && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Type"
                value={formData.type}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    type: e.target.value as Transaction['type'],
                    category: '' // Reset category when type changes
                  });
                }}
                options={[
                  { value: 'income', label: 'Income' },
                  { value: 'expense', label: 'Expense' },
                ]}
              />
              <Input
                label="Amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                error={errors.amount}
                placeholder="1000"
              />
              <Select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={[
                  { value: '', label: 'Select Category' },
                  ...getCategoryOptions()
                ]}
                error={errors.category}
              />
              <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                error={errors.date}
              />
            </div>
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              error={errors.description}
              placeholder="Lunch at restaurant"
            />
            <div className="flex space-x-3">
              <Button type="submit" loading={submitting}>
                {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
              </Button>
              <Button type="button" variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'income', label: 'Income Only' },
              { value: 'expense', label: 'Expenses Only' },
            ]}
          />
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              ...allCategories.map(cat => ({ value: cat, label: cat }))
            ]}
          />
        </div>
      </Card>

      {/* Transaction List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-100">
          Transaction History ({filteredTransactions.length})
        </h2>
        {filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="hover:bg-slate-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      transaction.type === 'income' 
                        ? 'bg-emerald-400/20 text-emerald-400' 
                        : 'bg-red-400/20 text-red-400'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100">{transaction.description}</h3>
                      <p className="text-sm text-slate-400">
                        {transaction.category} • {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`font-semibold ${
                      transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(transaction)}
                        icon={Edit}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(transaction.id)}
                        icon={Trash2}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              {searchTerm || filterType !== 'all' || filterCategory !== 'all' 
                ? 'No transactions found' 
                : 'No transactions yet'
              }
            </h3>
            <p className="text-slate-400 mb-4">
              {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by adding your first transaction'
              }
            </p>
            {(!searchTerm && filterType === 'all' && filterCategory === 'all') && (
              <Button onClick={() => setIsAddingTransaction(true)} icon={Plus}>
                Add Your First Transaction
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default Transactions;