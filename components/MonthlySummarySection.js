'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMonthlyTransactions, getMonthlyExpenses } from '@/app/actions/transactions';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { formatDate } from './utils';

export default function MonthlySummarySection() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM format
  const [monthlyTransactions, setMonthlyTransactions] = useState([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    const [year, month] = selectedMonth.split('-').map(Number);
    const [transactionsResult, expensesResult] = await Promise.all([
      getMonthlyTransactions(year, month),
      getMonthlyExpenses(year, month)
    ]);

    if (transactionsResult.error) {
      setError('মাসিক লেনদেন লোড করতে ব্যর্থ।');
    } else {
      setMonthlyTransactions(transactionsResult.data || []);
    }

    if (expensesResult.error) {
      setError('মাসিক খরচ লোড করতে ব্যর্থ।');
    } else {
      setMonthlyExpenses(expensesResult.data || []);
    }
    
    setLoading(false);
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time updates
  useSupabaseRealtime('transactions', useCallback((payload) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
      fetchData();
    }
  }, [fetchData]));

  useSupabaseRealtime('expenses', useCallback((payload) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
      fetchData();
    }
  }, [fetchData]));

  const totalMonthlyIncome = monthlyTransactions.reduce((sum, t) => sum + (t.amount_paid || 0), 0);
  const totalMonthlyExpenses = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const monthlyProfit = totalMonthlyIncome - totalMonthlyExpenses;

  const getMonthName = (dateString) => {
    const [year, month] = dateString.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">মাসিক আয় ও ব্যয় সারসংক্ষেপ</h2>

      <div className="mb-6">
        <label htmlFor="monthSelect" className="block text-gray-800 text-sm font-semibold mb-2">মাস নির্বাচন করুন:</label>
        <input
          type="month"
          id="monthSelect"
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
          <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">{getMonthName(selectedMonth)} মাসের সারসংক্ষেপ</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-100 p-5 rounded-lg shadow-md text-center">
              <p className="text-gray-700 text-lg font-semibold">মোট আয়:</p>
              <p className="text-3xl font-bold text-blue-800">{totalMonthlyIncome.toLocaleString('bn-BD')} ৳</p>
            </div>
            <div className="bg-red-100 p-5 rounded-lg shadow-md text-center">
              <p className="text-gray-700 text-lg font-semibold">মোট খরচ:</p>
              <p className="text-3xl font-bold text-red-800">{totalMonthlyExpenses.toLocaleString('bn-BD')} ৳</p>
            </div>
            <div className={`p-5 rounded-lg shadow-md text-center ${monthlyProfit >= 0 ? 'bg-green-100' : 'bg-orange-100'}`}>
              <p className="text-gray-700 text-lg font-semibold">মাসিক লাভ/ক্ষতি:</p>
              <p className={`text-3xl font-bold ${monthlyProfit >= 0 ? 'text-green-800' : 'text-orange-800'}`}>
                {monthlyProfit.toLocaleString('bn-BD')} ৳
              </p>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mt-10 mb-6 border-b pb-3">মাসিক লেনদেন</h3>
          {monthlyTransactions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">এই মাসের কোনো লেনদেন নেই।</p>
          ) : (
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full bg-white rounded-lg shadow-md">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tl-lg">তারিখ</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">রোগীর নাম</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">কাজের বিবরণ</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">পরিমাণ (৳)</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tr-lg">পেমেন্ট পদ্ধতি</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-gray-800">{formatDate(tx.date)}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{tx.patient_name}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{tx.work_done}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{tx.amount_paid.toLocaleString('bn-BD')}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{tx.payment_method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3 className="text-2xl font-bold text-gray-800 mt-10 mb-6 border-b pb-3">মাসিক খরচ</h3>
          {monthlyExpenses.length === 0 ? (
            <p className="text-gray-600 text-center py-8">এই মাসের কোনো খরচ নেই।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow-md">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tl-lg">তারিখ</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">বিবরণ</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tr-lg">পরিমাণ (৳)</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyExpenses.map((exp) => (
                    <tr key={exp.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-800">{formatDate(exp.date)}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">{exp.description}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">{exp.amount.toLocaleString('bn-BD')}</td>
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