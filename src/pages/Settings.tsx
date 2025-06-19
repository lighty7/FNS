import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { 
  Download, 
  Upload, 
  Trash2, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Settings as SettingsIcon,
  RefreshCw
} from 'lucide-react';
import { exportData } from '../utils/calculations';

const Settings: React.FC = () => {
  const { state, updateBudget, refreshData } = useFinance();
  const { user } = useAuth();
  const [monthlyIncome, setMonthlyIncome] = useState(state.monthlyBudget.income.toString());
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateIncome = async () => {
    const income = parseFloat(monthlyIncome);
    if (isNaN(income) || income < 0) {
      showNotification('error', 'Please enter a valid income amount');
      return;
    }

    setLoading(true);
    try {
      await updateBudget({
        ...state.monthlyBudget,
        income,
      });
      showNotification('success', 'Monthly income updated successfully');
    } catch (error) {
      showNotification('error', 'Failed to update income');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    try {
      exportData(state);
      showNotification('success', 'Data exported successfully');
    } catch (error) {
      showNotification('error', 'Failed to export data');
    }
  };

  const handleRefreshData = async () => {
    setLoading(true);
    try {
      await refreshData();
      showNotification('success', 'Data refreshed successfully');
    } catch (error) {
      showNotification('error', 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalEMIs: state.emis.length,
    totalTransactions: state.transactions.length,
    totalLoanAmount: state.emis.reduce((sum, emi) => sum + emi.loanAmount, 0),
    dataSize: Math.round(JSON.stringify(state).length / 1024), // Size in KB
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Settings</h1>
        <p className="text-slate-400">Manage your app preferences and data</p>
      </div>

      {/* Notification */}
      {notification && (
        <Card className={`border-l-4 ${
          notification.type === 'success' 
            ? 'border-emerald-400 bg-emerald-400/10' 
            : 'border-red-400 bg-red-400/10'
        }`}>
          <div className="flex items-center space-x-3">
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-400" />
            )}
            <p className={`${
              notification.type === 'success' ? 'text-emerald-300' : 'text-red-300'
            }`}>
              {notification.message}
            </p>
          </div>
        </Card>
      )}

      {/* User Info */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-emerald-400 rounded-full flex items-center justify-center">
            <span className="text-slate-900 font-semibold">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Account</h2>
            <p className="text-slate-400">{user?.email}</p>
          </div>
        </div>
      </Card>

      {/* Budget Settings */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <DollarSign className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-slate-100">Budget Settings</h2>
        </div>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                label="Monthly Income"
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="50000"
                helperText="Your fixed monthly income (salary, etc.)"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleUpdateIncome} loading={loading}>
                Update Income
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <SettingsIcon className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-100">Data Management</h2>
        </div>
        
        {/* Data Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.totalEMIs}</p>
            <p className="text-sm text-slate-400">EMIs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.totalTransactions}</p>
            <p className="text-sm text-slate-400">Transactions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-400">
              ₹{(stats.totalLoanAmount / 100000).toFixed(1)}L
            </p>
            <p className="text-sm text-slate-400">Total Loans</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-300">{stats.dataSize}KB</p>
            <p className="text-sm text-slate-400">Data Size</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Refresh Data */}
          <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
            <div>
              <h3 className="font-medium text-slate-100">Refresh Data</h3>
              <p className="text-sm text-slate-400">Sync your data from the server</p>
            </div>
            <Button onClick={handleRefreshData} icon={RefreshCw} variant="secondary" loading={loading}>
              Refresh
            </Button>
          </div>

          {/* Export Data */}
          <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
            <div>
              <h3 className="font-medium text-slate-100">Export Data</h3>
              <p className="text-sm text-slate-400">Download your data as a JSON file</p>
            </div>
            <Button onClick={handleExportData} icon={Download} variant="secondary">
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* App Information */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-100 mb-4">About</h2>
        <div className="space-y-2 text-sm text-slate-400">
          <p>Personal Finance Manager v1.0.0</p>
          <p>A Progressive Web App for managing your personal finances</p>
          <p>Data is securely stored in Supabase cloud database</p>
          <p className="text-emerald-400">✓ PWA Compatible - Install as app</p>
          <p className="text-emerald-400">✓ Cloud Sync</p>
          <p className="text-emerald-400">✓ Secure Authentication</p>
          <p className="text-emerald-400">✓ Dark Mode Only</p>
        </div>
      </Card>
    </div>
  );
};

export default Settings;