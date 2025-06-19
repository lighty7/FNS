import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { EMI, Transaction, MonthlyBudget } from '../types';
import { useAuth } from '../hooks/useAuth';
import { 
  getProfile, 
  updateProfile, 
  getEMIs, 
  createEMI, 
  updateEMI, 
  deleteEMI,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../services/database';

interface FinanceState {
  emis: EMI[];
  transactions: Transaction[];
  monthlyBudget: MonthlyBudget;
  loading: boolean;
  error: string | null;
}

type FinanceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EMIS'; payload: EMI[] }
  | { type: 'ADD_EMI'; payload: EMI }
  | { type: 'UPDATE_EMI'; payload: EMI }
  | { type: 'DELETE_EMI'; payload: string }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'UPDATE_BUDGET'; payload: MonthlyBudget }
  | { type: 'RESET_DATA' };

const initialState: FinanceState = {
  emis: [],
  transactions: [],
  monthlyBudget: {
    income: 0,
    fixedExpenses: 0,
    variableExpenses: 0,
    savings: 0,
  },
  loading: false,
  error: null,
};

const financeReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_EMIS':
      return { ...state, emis: action.payload };
    case 'ADD_EMI':
      return { ...state, emis: [action.payload, ...state.emis] };
    case 'UPDATE_EMI':
      return {
        ...state,
        emis: state.emis.map(emi => emi.id === action.payload.id ? action.payload : emi),
      };
    case 'DELETE_EMI':
      return { ...state, emis: state.emis.filter(emi => emi.id !== action.payload) };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(txn => txn.id === action.payload.id ? action.payload : txn),
      };
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(txn => txn.id !== action.payload) };
    case 'UPDATE_BUDGET':
      return { ...state, monthlyBudget: action.payload };
    case 'RESET_DATA':
      return { ...initialState };
    default:
      return state;
  }
};

interface FinanceContextType {
  state: FinanceState;
  // EMI actions
  addEMI: (emi: Omit<EMI, 'id'>) => Promise<void>;
  updateEMIAction: (emi: EMI) => Promise<void>;
  deleteEMIAction: (id: string) => Promise<void>;
  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransactionAction: (transaction: Transaction) => Promise<void>;
  deleteTransactionAction: (id: string) => Promise<void>;
  // Budget actions
  updateBudget: (budget: MonthlyBudget) => Promise<void>;
  // Data management
  refreshData: () => Promise<void>;
  resetData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(financeReducer, initialState);
  const { user } = useAuth();

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      dispatch({ type: 'RESET_DATA' });
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Load profile and budget
      const profile = await getProfile(user.id);
      if (profile) {
        dispatch({ 
          type: 'UPDATE_BUDGET', 
          payload: {
            income: profile.monthly_income,
            fixedExpenses: 0,
            variableExpenses: 0,
            savings: 0,
          }
        });
      }

      // Load EMIs and transactions in parallel
      const [emis, transactions] = await Promise.all([
        getEMIs(user.id),
        getTransactions(user.id)
      ]);

      dispatch({ type: 'SET_EMIS', payload: emis });
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
    } catch (error) {
      console.error('Error loading data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addEMI = async (emiData: Omit<EMI, 'id'>) => {
    if (!user) throw new Error('User not authenticated');

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const newEMI = await createEMI(user.id, emiData);
      dispatch({ type: 'ADD_EMI', payload: newEMI });
    } catch (error) {
      console.error('Error adding EMI:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add EMI' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateEMIAction = async (emi: EMI) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const updatedEMI = await updateEMI(emi.id, emi);
      dispatch({ type: 'UPDATE_EMI', payload: updatedEMI });
    } catch (error) {
      console.error('Error updating EMI:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update EMI' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteEMIAction = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await deleteEMI(id);
      dispatch({ type: 'DELETE_EMI', payload: id });
    } catch (error) {
      console.error('Error deleting EMI:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete EMI' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    if (!user) throw new Error('User not authenticated');

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const newTransaction = await createTransaction(user.id, transactionData);
      dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
    } catch (error) {
      console.error('Error adding transaction:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add transaction' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateTransactionAction = async (transaction: Transaction) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const updatedTransaction = await updateTransaction(transaction.id, transaction);
      dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedTransaction });
    } catch (error) {
      console.error('Error updating transaction:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update transaction' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteTransactionAction = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await deleteTransaction(id);
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete transaction' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateBudget = async (budget: MonthlyBudget) => {
    if (!user) throw new Error('User not authenticated');

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await updateProfile(user.id, { monthly_income: budget.income });
      dispatch({ type: 'UPDATE_BUDGET', payload: budget });
    } catch (error) {
      console.error('Error updating budget:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update budget' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  const resetData = () => {
    dispatch({ type: 'RESET_DATA' });
  };

  return (
    <FinanceContext.Provider value={{
      state,
      addEMI,
      updateEMIAction,
      deleteEMIAction,
      addTransaction,
      updateTransactionAction,
      deleteTransactionAction,
      updateBudget,
      refreshData,
      resetData,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};