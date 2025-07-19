'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMonthlyAppointments } from '@/app/actions/appointments';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { formatDate, formatTime } from './utils';

export default function MonthlyAppointmentSection() {
  const [monthlyAppointments, setMonthlyAppointments] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM format
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError('');

    const [year, month] = selectedMonth.split('-').map(Number);
    const result = await getMonthlyAppointments(year, month);

    if (result.error) {
      setError('মাসিক অ্যাপয়েন্টমেন্ট লোড করতে ব্যর্থ।');
    } else {
      setMonthlyAppointments(result.data || []);
    }
    setLoading(false);
  }, [selectedMonth]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Real-time updates
  useSupabaseRealtime('appointments', useCallback((payload) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
      fetchAppointments();
    }
  }, [fetchAppointments]));

  const getMonthName = (dateString) => {
    const [year, month] = dateString.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">মাসিক অ্যাপয়েন্টমেন্ট</h2>

      <div className="mb-6">
        <label htmlFor="monthSelectAppointments" className="block text-gray-800 text-sm font-semibold mb-2">মাস নির্বাচন করুন:</label>
        <input
          type="month"
          id="monthSelectAppointments"
          className="w-full md:w-1/3 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-600 py-8">লোড হচ্ছে...</p>
      ) : error ? (
        <p className="text-center text-red-500 py-8">{error}</p>
      ) : (
        <>
          <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">{getMonthName(selectedMonth)} মাসের অ্যাপয়েন্টমেন্ট</h3>
          {monthlyAppointments.length === 0 ? (
            <p className="text-gray-600 text-center py-8">এই মাসের কোনো অ্যাপয়েন্টমেন্ট নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow-md">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tl-lg">তারিখ</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">সময়</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">রোগীর নাম</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">মোবাইল</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tr-lg">কাজের বিবরণ</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyAppointments.map((appt) => (
                    <tr key={appt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-gray-800">{formatDate(appt.appointment_date)}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{formatTime(appt.appointment_time)}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{appt.patient_name}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{appt.mobile_number}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{appt.work_description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
} 