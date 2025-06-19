import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { calculateFinancialSummary, formatCurrency, getNextDueDate } from '../utils/calculations';
import Card from '../components/ui/Card';
import { TrendingUp, TrendingDown, CreditCard, Calendar, AlertCircle, PiggyBank } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { state } = useFinance();
  const { emis, transactions, monthlyBudget } = state;

  const financialSummary = useMemo(() => 
    calculateFinancialSummary(emis, transactions, monthlyBudget.income),
    [emis, transactions, monthlyBudget.income]
  );

  const upcomingEMIs = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return emis
      .map(emi => ({
        ...emi,
        nextDueDate: getNextDueDate(emi.dueDate),
      }))
      .filter(emi => emi.nextDueDate <= nextWeek)
      .sort((a, b) => a.nextDueDate.getTime() - b.nextDueDate.getTime());
  }, [emis]);

  const recentTransactions = useMemo(() => 
    transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5),
    [transactions]
  );

  const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ElementType;
    trend?: 'up' | 'down';
    color: string;
  }> = ({ title, value, icon: Icon, trend, color }) => (
    <Card className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-400', '-400/20')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
      {trend && (
        <div className="absolute top-2 right-2">
          {trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-400" />}
          {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-400" />}
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Financial Dashboard</h1>
        <p className="text-slate-400">Overview of your current financial status</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          value={formatCurrency(financialSummary.totalIncome)}
          icon={TrendingUp}
          color="text-emerald-400"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(financialSummary.totalExpenses)}
          icon={TrendingDown}
          color="text-red-400"
        />
        <StatCard
          title="EMIs"
          value={formatCurrency(financialSummary.totalEMIs)}
          icon={CreditCard}
          color="text-orange-400"
        />
        <StatCard
          title="Remaining Balance"
          value={formatCurrency(financialSummary.remainingBalance)}
          icon={PiggyBank}
          color={financialSummary.remainingBalance >= 0 ? "text-emerald-400" : "text-red-400"}
        />
      </div>

      {/* Financial Health */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Financial Health</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Savings Rate</span>
              <span className={`text-sm font-medium ${
                financialSummary.savingsRate >= 20 ? 'text-emerald-400' : 
                financialSummary.savingsRate >= 10 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {financialSummary.savingsRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  financialSummary.savingsRate >= 20 ? 'bg-emerald-400' : 
                  financialSummary.savingsRate >= 10 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${Math.min(Math.max(financialSummary.savingsRate, 0), 100)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming EMIs */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">Upcoming EMIs</h2>
            <Calendar className="h-5 w-5 text-slate-400" />
          </div>
          {upcomingEMIs.length > 0 ? (
            <div className="space-y-3">
              {upcomingEMIs.map(emi => (
                <div key={emi.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-100">{emi.name}</p>
                    <p className="text-sm text-slate-400">
                      Due: {emi.nextDueDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-orange-400">
                      {formatCurrency(emi.emiAmount)}
                    </span>
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No upcoming EMIs in the next 7 days</p>
          )}
        </Card>

        {/* Recent Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">Recent Transactions</h2>
            <CreditCard className="h-5 w-5 text-slate-400" />
          </div>
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-100">{transaction.description}</p>
                    <p className="text-sm text-slate-400">
                      {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                    </p>
                  </div>
                  <span className={`font-semibold ${
                    transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No recent transactions</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;