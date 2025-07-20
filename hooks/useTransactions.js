"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getTransactionsByDate,
  getMonthlyTransactions,
  createTransaction, 
  updateTransaction, 
  deleteTransaction,
  getExpensesByDate,
  getMonthlyExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} from "@/app/actions/transactions";

export const TRANSACTIONS_QUERY_KEYS = {
  all: ["transactions"],
  byDate: (date) => ["transactions", "byDate", date],
  monthly: (year, month) => ["transactions", "monthly", year, month],
};

export const EXPENSES_QUERY_KEYS = {
  all: ["expenses"],
  byDate: (date) => ["expenses", "byDate", date],
  monthly: (year, month) => ["expenses", "monthly", year, month],
};

/**
 * Hook for fetching transactions by date
 */
export function useTransactionsByDate(date) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: TRANSACTIONS_QUERY_KEYS.byDate(date),
    queryFn: async () => {
      const result = await getTransactionsByDate(date);
      if (result.error) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!date,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    transactions: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for fetching monthly transactions
 */
export function useMonthlyTransactions(year, month) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: TRANSACTIONS_QUERY_KEYS.monthly(year, month),
    queryFn: async () => {
      const result = await getMonthlyTransactions(year, month);
      if (result.error) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!(year && month),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    transactions: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for fetching expenses by date
 */
export function useExpensesByDate(date) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: EXPENSES_QUERY_KEYS.byDate(date),
    queryFn: async () => {
      const result = await getExpensesByDate(date);
      if (result.error) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!date,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    expenses: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for fetching monthly expenses
 */
export function useMonthlyExpenses(year, month) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: EXPENSES_QUERY_KEYS.monthly(year, month),
    queryFn: async () => {
      const result = await getMonthlyExpenses(year, month);
      if (result.error) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!(year && month),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    expenses: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for transaction CRUD operations
 */
export function useTransactionActions() {
  const queryClient = useQueryClient();

  // Create transaction mutation
  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: TRANSACTIONS_QUERY_KEYS.all 
      });
    },
    onError: (error) => {
      throw error;
    },
  });

  // Update transaction mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: TRANSACTIONS_QUERY_KEYS.all 
      });
    },
    onError: (error) => {
      throw error;
    },
  });

  // Delete transaction mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: TRANSACTIONS_QUERY_KEYS.all 
      });
    },
    onError: (error) => {
      throw error;
    },
  });

  return {
    createTransaction: createMutation.mutateAsync,
    updateTransaction: updateMutation.mutateAsync,
    deleteTransaction: deleteMutation.mutateAsync,
    
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}

/**
 * Hook for expense CRUD operations
 */
export function useExpenseActions() {
  const queryClient = useQueryClient();

  // Create expense mutation
  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: EXPENSES_QUERY_KEYS.all 
      });
    },
    onError: (error) => {
      throw error;
    },
  });

  // Update expense mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: EXPENSES_QUERY_KEYS.all 
      });
    },
    onError: (error) => {
      throw error;
    },
  });

  // Delete expense mutation
  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: EXPENSES_QUERY_KEYS.all 
      });
    },
    onError: (error) => {
      throw error;
    },
  });

  return {
    createExpense: createMutation.mutateAsync,
    updateExpense: updateMutation.mutateAsync,
    deleteExpense: deleteMutation.mutateAsync,
    
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
} 