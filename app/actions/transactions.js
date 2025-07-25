'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// ==================== TRANSACTIONS ====================

export async function getTransactionsByDate(date) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('date', date)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return { error: error.message };
  }

  return { data };
}

export async function getMonthlyTransactions(year, month) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching monthly transactions:', error);
    return { error: error.message };
  }

  return { data };
}

export async function createTransaction(transactionData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('transactions')
    .insert([transactionData])
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    return { error: error.message };
  }

  return { data };
}

export async function updateTransaction(id, updates) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating transaction:', error);
    return { error: error.message };
  }

  return { data };
}

export async function deleteTransaction(id) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting transaction:', error);
    return { error: error.message };
  }

  return { success: true };
}

// ==================== EXPENSES ====================

export async function getExpensesByDate(date) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('date', date)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    return { error: error.message };
  }

  return { data };
}

export async function getMonthlyExpenses(year, month) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching monthly expenses:', error);
    return { error: error.message };
  }

  return { data };
}

export async function createExpense(expenseData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('expenses')
    .insert([expenseData])
    .select()
    .single();

  if (error) {
    console.error('Error creating expense:', error);
    return { error: error.message };
  }

  return { data };
}

export async function updateExpense(id, updates) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating expense:', error);
    return { error: error.message };
  }

  return { data };
}

export async function deleteExpense(id) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting expense:', error);
    return { error: error.message };
  }

  return { success: true };
} 