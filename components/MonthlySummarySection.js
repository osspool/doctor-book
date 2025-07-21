'use client';

import { useState, useCallback } from 'react';
import { 
  useMonthlyTransactions,
  useMonthlyExpenses,
  useTransactionActions,
  useExpenseActions
} from '@/hooks/useTransactions';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { formatDate } from './ui/utils';
import Modal from './ui/Modal';

export default function MonthlySummarySection() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM format
  const [message, setMessage] = useState('');
  
  // Modal states
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  // Parse selected month
  const [year, month] = selectedMonth.split('-').map(Number);

  // Use hooks
  const { transactions: monthlyTransactions, isLoading: transactionsLoading, error: transactionsError } = useMonthlyTransactions(year, month);
  const { expenses: monthlyExpenses, isLoading: expensesLoading, error: expensesError } = useMonthlyExpenses(year, month);
  const { updateTransaction, deleteTransaction, isUpdating: isUpdatingTransaction } = useTransactionActions();
  const { updateExpense, deleteExpense, isUpdating: isUpdatingExpense } = useExpenseActions();

  // Real-time updates (handled in hooks)
  useSupabaseRealtime('transactions', useCallback(() => {
    // Real-time invalidation is handled in the hooks
  }, []));

  useSupabaseRealtime('expenses', useCallback(() => {
    // Real-time invalidation is handled in the hooks
  }, []));

  // Transaction edit/delete handlers
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleDeleteTransaction = async (id) => {
    if (confirm('আপনি কি নিশ্চিত যে এই লেনদেন মুছে ফেলতে চান?')) {
      try {
        await deleteTransaction(id);
        setMessage('লেনদেন সফলভাবে মুছে ফেলা হয়েছে।');
      } catch (error) {
        setMessage('লেনদেন মুছতে ব্যর্থ।');
      }
    }
  };

  const handleUpdateTransaction = async (formData) => {
    try {
      await updateTransaction({ id: editingTransaction.id, data: formData });
      setMessage('লেনদেন সফলভাবে আপডেট করা হয়েছে!');
      setIsTransactionModalOpen(false);
      setEditingTransaction(null);
    } catch (error) {
      setMessage('লেনদেন আপডেট করতে ব্যর্থ।');
    }
  };

  // Expense edit/delete handlers
  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleDeleteExpense = async (id) => {
    if (confirm('আপনি কি নিশ্চিত যে এই খরচ মুছে ফেলতে চান?')) {
      try {
        await deleteExpense(id);
        setMessage('খরচ সফলভাবে মুছে ফেলা হয়েছে।');
      } catch (error) {
        setMessage('খরচ মুছতে ব্যর্থ।');
      }
    }
  };

  const handleUpdateExpense = async (formData) => {
    try {
      await updateExpense({ id: editingExpense.id, data: formData });
      setMessage('খরচ সফলভাবে আপডেট করা হয়েছে!');
      setIsExpenseModalOpen(false);
      setEditingExpense(null);
    } catch (error) {
      setMessage('খরচ আপডেট করতে ব্যর্থ।');
    }
  };

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

      {message && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-md">
          {message}
        </div>
      )}

      {(transactionsLoading || expensesLoading) ? (
        <p className="text-center text-gray-600 py-8">লোড হচ্ছে...</p>
      ) : (transactionsError || expensesError) ? (
        <p className="text-center text-red-500 py-8">ডেটা লোড করতে সমস্যা হয়েছে</p>
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
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">পেমেন্ট পদ্ধতি</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tr-lg">কার্যক্রম</th>
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
                      <td className="py-3 px-4 text-sm text-gray-800">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditTransaction(tx)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
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
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">পরিমাণ (৳)</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tr-lg">কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyExpenses.map((exp) => (
                    <tr key={exp.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-800">{formatDate(exp.date)}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">{exp.description}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">{exp.amount.toLocaleString('bn-BD')}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditExpense(exp)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Transaction Edit Modal */}
      <Modal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        title="লেনদেন সম্পাদনা"
      >
        {editingTransaction && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            handleUpdateTransaction({
              patient_name: formData.get('patient_name'),
              work_done: formData.get('work_done'),
              amount_paid: parseFloat(formData.get('amount_paid')),
              payment_method: formData.get('payment_method'),
              is_free: formData.get('is_free') === 'on',
              date: formData.get('date')
            });
          }} className="space-y-4">
            <div>
              <label className="block text-gray-800 text-sm font-semibold mb-2">রোগীর নাম:</label>
              <input
                type="text"
                name="patient_name"
                defaultValue={editingTransaction.patient_name}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-gray-800 text-sm font-semibold mb-2">কি কাজ হলো:</label>
              <textarea
                name="work_done"
                defaultValue={editingTransaction.work_done}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                rows="2"
                required
              />
            </div>
            <div>
              <label className="block text-gray-800 text-sm font-semibold mb-2">কত টাকা দিলো:</label>
              <input
                type="number"
                name="amount_paid"
                defaultValue={editingTransaction.amount_paid}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-gray-800 text-sm font-semibold mb-2">পেমেন্ট পদ্ধতি:</label>
              <select
                name="payment_method"
                defaultValue={editingTransaction.payment_method}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                required
              >
                <option value="Cash">ক্যাশ</option>
                <option value="bKash">বিকাশ</option>
                <option value="Online">অনলাইন</option>
                <option value="Free">ফ্রি</option>
              </select>
            </div>
            <input type="hidden" name="date" value={editingTransaction.date} />
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isUpdatingTransaction}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 font-semibold"
              >
                {isUpdatingTransaction ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
              </button>
              <button
                type="button"
                onClick={() => setIsTransactionModalOpen(false)}
                className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 font-semibold"
              >
                বাতিল
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Expense Edit Modal */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="খরচ সম্পাদনা"
      >
        {editingExpense && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            handleUpdateExpense({
              description: formData.get('description'),
              amount: parseFloat(formData.get('amount')),
              date: formData.get('date')
            });
          }} className="space-y-4">
            <div>
              <label className="block text-gray-800 text-sm font-semibold mb-2">খরচের বিবরণ:</label>
              <input
                type="text"
                name="description"
                defaultValue={editingExpense.description}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-gray-800 text-sm font-semibold mb-2">পরিমাণ (টাকা):</label>
              <input
                type="number"
                name="amount"
                defaultValue={editingExpense.amount}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
                min="0"
                step="0.01"
                required
              />
            </div>
            <input type="hidden" name="date" value={editingExpense.date} />
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isUpdatingExpense}
                className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:bg-red-300 font-semibold"
              >
                {isUpdatingExpense ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
              </button>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 font-semibold"
              >
                বাতিল
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
} 