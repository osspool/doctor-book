"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getAppointments, 
  getMonthlyAppointments,
  createAppointment, 
  updateAppointment, 
  deleteAppointment 
} from "@/app/actions/appointments";

export const APPOINTMENTS_QUERY_KEYS = {
  all: ["appointments"],
  today: () => ["appointments", "today"],
  monthly: (year, month) => ["appointments", "monthly", year, month],
  byDate: (date) => ["appointments", "byDate", date],
};

/**
 * Hook for fetching today's appointments
 */
export function useTodayAppointments() {
  const getToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: APPOINTMENTS_QUERY_KEYS.today(),
    queryFn: async () => {
      const result = await getAppointments(getToday());
      if (result.error) throw new Error(result.error);
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    appointments: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for fetching monthly appointments
 */
export function useMonthlyAppointments(year, month) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: APPOINTMENTS_QUERY_KEYS.monthly(year, month),
    queryFn: async () => {
      const result = await getMonthlyAppointments(year, month);
      if (result.error) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!(year && month),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    appointments: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for appointment CRUD operations
 */
export function useAppointmentActions() {
  const queryClient = useQueryClient();

  // Create appointment mutation
  const createMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: APPOINTMENTS_QUERY_KEYS.all 
      });
    },
    onError: (error) => {
      throw error;
    },
  });

  // Update appointment mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: APPOINTMENTS_QUERY_KEYS.all 
      });
    },
    onError: (error) => {
      throw error;
    },
  });

  // Delete appointment mutation
  const deleteMutation = useMutation({
    mutationFn: deleteAppointment,
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: APPOINTMENTS_QUERY_KEYS.all });
      
      // Optimistically update today's appointments
      const previousData = queryClient.getQueryData(APPOINTMENTS_QUERY_KEYS.today());
      if (previousData) {
        queryClient.setQueryData(
          APPOINTMENTS_QUERY_KEYS.today(),
          previousData.filter(appointment => appointment.id !== id)
        );
      }
      
      return { previousData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: APPOINTMENTS_QUERY_KEYS.all 
      });
    },
    onError: (error, variables, context) => {
      // Roll back optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(APPOINTMENTS_QUERY_KEYS.today(), context.previousData);
      }
      throw error;
    },
  });

  return {
    createAppointment: createMutation.mutateAsync,
    updateAppointment: updateMutation.mutateAsync,
    deleteAppointment: deleteMutation.mutateAsync,
    
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
} 