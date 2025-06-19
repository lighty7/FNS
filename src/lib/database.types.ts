export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          monthly_income: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          monthly_income?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          monthly_income?: number
          created_at?: string
          updated_at?: string
        }
      }
      emis: {
        Row: {
          id: string
          user_id: string
          name: string
          loan_amount: number
          emi_amount: number
          due_date: number
          start_date: string
          duration: number
          remaining_months: number
          interest_rate: number | null
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          loan_amount: number
          emi_amount: number
          due_date: number
          start_date: string
          duration: number
          remaining_months: number
          interest_rate?: number | null
          category: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          loan_amount?: number
          emi_amount?: number
          due_date?: number
          start_date?: string
          duration?: number
          remaining_months?: number
          interest_rate?: number | null
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: 'income' | 'expense'
          category: string
          description: string
          date: string
          is_recurring: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: 'income' | 'expense'
          category: string
          description: string
          date: string
          is_recurring?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: 'income' | 'expense'
          category?: string
          description?: string
          date?: string
          is_recurring?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}