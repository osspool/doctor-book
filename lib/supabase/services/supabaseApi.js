import { supabase } from "@/integrations/supabase/client";

// ==================== AUTH SERVICES ====================

export const authService = {
  // Sign up new user
  async signUp(email, password, metadata) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    return { data, error };
  },

  // Sign in user
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// ==================== APPOINTMENTS SERVICES ====================

export const appointmentsService = {
  // Get all appointments for user
  async getAppointments(userId) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .order('appointment_date', { ascending: true });
    return { data, error };
  },

  // Get appointments for specific date
  async getAppointmentsByDate(userId, date) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .gte('appointment_date', `${date}T00:00:00`)
      .lt('appointment_date', `${date}T23:59:59`)
      .order('appointment_time', { ascending: true });
    return { data, error };
  },

  // Create new appointment
  async createAppointment(appointment) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select();
    return { data, error };
  },

  // Update appointment
  async updateAppointment(id, updates) {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  },

  // Delete appointment
  async deleteAppointment(id) {
    const { data, error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  // Real-time subscription for appointments
  subscribeToAppointments(userId, callback) {
    return supabase
      .channel('appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }
};

// ==================== TRANSACTIONS SERVICES ====================

export const transactionsService = {
  // Get all transactions for user
  async getTransactions(userId) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    return { data, error };
  },

  // Get transactions by date range
  async getTransactionsByDateRange(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    return { data, error };
  },

  // Create new transaction
  async createTransaction(transaction) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select();
    return { data, error };
  },

  // Get monthly summary
  async getMonthlySummary(userId, year, month) {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
    
    const { data, error } = await supabase
      .from('transactions')
      .select('amount_paid, is_free')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);
    
    return { data, error };
  }
};

// ==================== EXPENSES SERVICES ====================

export const expensesService = {
  // Get all expenses for user
  async getExpenses(userId) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    return { data, error };
  },

  // Get expenses by date range
  async getExpensesByDateRange(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    return { data, error };
  },

  // Create new expense
  async createExpense(expense) {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select();
    return { data, error };
  }
};

// ==================== PROFILES SERVICES ====================

export const profilesService = {
  // Get user profile
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  // Create or update profile
  async upsertProfile(profile) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert([profile])
      .select();
    return { data, error };
  }
};

// ==================== STORAGE SERVICES ====================

export const storageService = {
  // Upload file
  async uploadFile(bucket, path, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    return { data, error };
  },

  // Download file
  async downloadFile(bucket, path) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);
    return { data, error };
  },

  // Get public URL
  getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },

  // Delete file
  async deleteFile(bucket, path) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    return { data, error };
  }
};

// ==================== REAL-TIME SERVICES ====================

export const realtimeService = {
  // Subscribe to table changes
  subscribeToTable(table, callback, filter) {
    const channel = supabase.channel(`${table}-changes`);
    
    if (filter) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter
        },
        callback
      );
    } else {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table
        },
        callback
      );
    }
    
    return channel.subscribe();
  },

  // Unsubscribe from channel
  unsubscribe(channel) {
    return supabase.removeChannel(channel);
  }
};