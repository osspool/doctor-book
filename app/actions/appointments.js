'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function getAppointments(date = null) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from('appointments')
    .select('*');

  if (date) {
    query = query.eq('appointment_date', date);
  }

  const { data, error } = await query.order('appointment_date', { ascending: true });

  if (error) {
    console.error('Error fetching appointments:', error);
    return { error: error.message };
  }

  return { data };
}

export async function getMonthlyAppointments(year, month) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .gte('appointment_date', startDate)
    .lte('appointment_date', endDate)
    .order('appointment_date', { ascending: true });

  if (error) {
    console.error('Error fetching monthly appointments:', error);
    return { error: error.message };
  }

  return { data };
}

export async function createAppointment(appointmentData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('appointments')
    .insert([appointmentData])
    .select()
    .single();

  if (error) {
    console.error('Error creating appointment:', error);
    return { error: error.message };
  }

  return { data };
}

export async function updateAppointment(id, updates) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating appointment:', error);
    return { error: error.message };
  }

  return { data };
}

export async function deleteAppointment(id) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting appointment:', error);
    return { error: error.message };
  }

  return { success: true };
} 