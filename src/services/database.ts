import { supabase } from '../lib/supabase';
import { EMI, Transaction } from '../types';
import { Database } from '../lib/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type EMIRow = Database['public']['Tables']['emis']['Row'];
type TransactionRow = Database['public']['Tables']['transactions']['Row'];

// Profile operations
export const getProfile = async (userId: string): Promise<ProfileRow | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
};

export const updateProfile = async (userId: string, updates: Partial<ProfileRow>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }

  return data;
};

// EMI operations
export const getEMIs = async (userId: string): Promise<EMI[]> => {
  const { data, error } = await supabase
    .from('emis')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching EMIs:', error);
    return [];
  }

  return data.map(mapEMIRowToEMI);
};

export const createEMI = async (userId: string, emi: Omit<EMI, 'id'>): Promise<EMI> => {
  const { data, error } = await supabase
    .from('emis')
    .insert({
      user_id: userId,
      name: emi.name,
      loan_amount: emi.loanAmount,
      emi_amount: emi.emiAmount,
      due_date: emi.dueDate,
      start_date: emi.startDate,
      duration: emi.duration,
      remaining_months: emi.remainingMonths,
      interest_rate: emi.interestRate || null,
      category: emi.category,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating EMI:', error);
    throw error;
  }

  return mapEMIRowToEMI(data);
};

export const updateEMI = async (emiId: string, updates: Partial<EMI>): Promise<EMI> => {
  const updateData: any = { updated_at: new Date().toISOString() };
  
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.loanAmount !== undefined) updateData.loan_amount = updates.loanAmount;
  if (updates.emiAmount !== undefined) updateData.emi_amount = updates.emiAmount;
  if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
  if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
  if (updates.duration !== undefined) updateData.duration = updates.duration;
  if (updates.remainingMonths !== undefined) updateData.remaining_months = updates.remainingMonths;
  if (updates.interestRate !== undefined) updateData.interest_rate = updates.interestRate;
  if (updates.category !== undefined) updateData.category = updates.category;

  const { data, error } = await supabase
    .from('emis')
    .update(updateData)
    .eq('id', emiId)
    .select()
    .single();

  if (error) {
    console.error('Error updating EMI:', error);
    throw error;
  }

  return mapEMIRowToEMI(data);
};

export const deleteEMI = async (emiId: string): Promise<void> => {
  const { error } = await supabase
    .from('emis')
    .delete()
    .eq('id', emiId);

  if (error) {
    console.error('Error deleting EMI:', error);
    throw error;
  }
};

// Transaction operations
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return data.map(mapTransactionRowToTransaction);
};

export const createTransaction = async (userId: string, transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      description: transaction.description,
      date: transaction.date,
      is_recurring: transaction.isRecurring || false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }

  return mapTransactionRowToTransaction(data);
};

export const updateTransaction = async (transactionId: string, updates: Partial<Transaction>): Promise<Transaction> => {
  const updateData: any = { updated_at: new Date().toISOString() };
  
  if (updates.amount !== undefined) updateData.amount = updates.amount;
  if (updates.type !== undefined) updateData.type = updates.type;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.date !== undefined) updateData.date = updates.date;
  if (updates.isRecurring !== undefined) updateData.is_recurring = updates.isRecurring;

  const { data, error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', transactionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }

  return mapTransactionRowToTransaction(data);
};

export const deleteTransaction = async (transactionId: string): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId);

  if (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Helper functions to map database rows to app types
const mapEMIRowToEMI = (row: EMIRow): EMI => ({
  id: row.id,
  name: row.name,
  loanAmount: row.loan_amount,
  emiAmount: row.emi_amount,
  dueDate: row.due_date,
  startDate: row.start_date,
  duration: row.duration,
  remainingMonths: row.remaining_months,
  interestRate: row.interest_rate || undefined,
  category: row.category as EMI['category'],
});

const mapTransactionRowToTransaction = (row: TransactionRow): Transaction => ({
  id: row.id,
  amount: row.amount,
  type: row.type,
  category: row.category,
  description: row.description,
  date: row.date,
  isRecurring: row.is_recurring,
});