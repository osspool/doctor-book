'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  getTransactionsByDate, 
  createTransaction, 
  updateTransaction,
  deleteTransaction,
  getExpensesByDate, 
  createExpense,
  updateExpense,
  deleteExpense 
} from '@/app/actions/transactions';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { formatDate } from './utils';

export default function TransactionSection() {
  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [patientName, setPatientName] = useState('');
  const [workDone, setWorkDone] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isFree, setIsFree] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [transactionMessage, setTransactionMessage] = useState('');
  const [expenseMessage, setExpenseMessage] = useState('');
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [isEditingTransaction, setIsEditingTransaction] = useState(false);
  const [isEditingExpense, setIsEditingExpense] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    const [transactionsResult, expensesResult] = await Promise.all([
      getTransactionsByDate(transactionDate),
      getExpensesByDate(transactionDate)
    ]);

    if (transactionsResult.error) {
      setTransactionMessage('লেনদেন লোড করতে ব্যর্থ।');
    } else {
      setTransactions(transactionsResult.data || []);
    }

    if (expensesResult.error) {
      setExpenseMessage('খরচ লোড করতে ব্যর্থ।');
    } else {
      setExpenses(expensesResult.data || []);
    }
  }, [transactionDate]);

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

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setTransactionMessage('');

    if (!patientName || !workDone || (!isFree && !amountPaid)) {
      setTransactionMessage('সব তথ্য পূরণ করুন।');
      return;
    }

    try {
      const result = await createTransaction({
        date: transactionDate,
        patient_name: patientName,
        work_done: workDone,
        amount_paid: isFree ? 0 : parseFloat(amountPaid),
        payment_method: isFree ? 'Free' : paymentMethod,
        is_free: isFree
      });

      if (result.error) {
        setTransactionMessage('লেনদেন যোগ করতে ব্যর্থ।');
      } else {
        setTransactionMessage('লেনদেন সফলভাবে যোগ করা হয়েছে!');
        setPatientName('');
        setWorkDone('');
        setAmountPaid('');
        setIsFree(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      setTransactionMessage('লেনদেন যোগ করতে ব্যর্থ।');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setExpenseMessage('');

    if (!expenseDescription || !expenseAmount) {
      setExpenseMessage('সব তথ্য পূরণ করুন।');
      return;
    }

    try {
      const result = await createExpense({
        date: transactionDate,
        description: expenseDescription,
        amount: parseFloat(expenseAmount)
      });

      if (result.error) {
        setExpenseMessage('খরচ যোগ করতে ব্যর্থ।');
      } else {
        setExpenseMessage('খরচ সফলভাবে যোগ করা হয়েছে!');
        setExpenseDescription('');
        setExpenseAmount('');
        fetchData();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      setExpenseMessage('খরচ যোগ করতে ব্যর্থ।');
    }
  };

  const totalIncomeToday = transactions.reduce((sum, t) => sum + (t.amount_paid || 0), 0);
  const totalExpensesToday = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const freePatientsToday = transactions.filter(t => t.is_free).length;

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">দৈনিক লেনদেন ও খরচ</h2>

      <div className="mb-6">
        <label htmlFor="transactionDate" className="block text-gray-800 text-sm font-semibold mb-2">তারিখ নির্বাচন করুন:</label>
        <input
          type="date"
          id="transactionDate"
          className="w-full md:w-1/3 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Transaction Form */}
        <div className="bg-green-50 p-6 rounded-lg shadow-inner">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">নতুন লেনদেন যোগ করুন</h3>
          <form onSubmit={handleAddTransaction} className="space-y-4">
            <div>
              <label htmlFor="patientNameTx" className="block text-gray-800 text-sm font-semibold mb-2">রোগীর নাম:</label>
              <input
                type="text"
                id="patientNameTx"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="workDone" className="block text-gray-800 text-sm font-semibold mb-2">কি কাজ হলো:</label>
              <textarea
                id="workDone"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
                rows="2"
                value={workDone}
                onChange={(e) => setWorkDone(e.target.value)}
                required
              ></textarea>
            </div>
            <div>
              <label htmlFor="amountPaid" className="block text-gray-800 text-sm font-semibold mb-2">কত টাকা দিলো:</label>
              <input
                type="number"
                id="amountPaid"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 disabled:bg-gray-100"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                min="0"
                step="0.01"
                disabled={isFree}
                required={!isFree}
              />
            </div>
            <div>
              <label htmlFor="paymentMethod" className="block text-gray-800 text-sm font-semibold mb-2">পেমেন্ট পদ্ধতি:</label>
              <select
                id="paymentMethod"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 disabled:bg-gray-100"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={isFree}
                required={!isFree}
              >
                <option value="Cash">ক্যাশ</option>
                <option value="bKash">বিকাশ</option>
                <option value="Online">অনলাইন</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFree"
                className="mr-2 h-5 w-5 text-green-600 rounded focus:ring-green-500"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
              />
              <label htmlFor="isFree" className="text-gray-800 text-sm font-semibold">ফ্রি রোগী</label>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 font-semibold"
            >
              লেনদেন যোগ করুন
            </button>
            {transactionMessage && <p className="text-center text-sm mt-2 text-green-600">{transactionMessage}</p>}
          </form>
        </div>

        {/* Add Expense Form */}
        <div className="bg-red-50 p-6 rounded-lg shadow-inner">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">নতুন খরচ যোগ করুন</h3>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label htmlFor="expenseDescription" className="block text-gray-800 text-sm font-semibold mb-2">খরচের বিবরণ:</label>
              <input
                type="text"
                id="expenseDescription"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="expenseAmount" className="block text-gray-800 text-sm font-semibold mb-2">পরিমাণ (টাকা):</label>
              <input
                type="number"
                id="expenseAmount"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105 font-semibold"
            >
              খরচ যোগ করুন
            </button>
            {expenseMessage && <p className="text-center text-sm mt-2 text-red-600">{expenseMessage}</p>}
          </form>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-800 mt-10 mb-6 border-b pb-3">আজকের সারসংক্ষেপ ({formatDate(new Date(transactionDate))})</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-100 p-5 rounded-lg shadow-md text-center">
          <p className="text-gray-700 text-lg font-semibold">মোট আয়:</p>
          <p className="text-3xl font-bold text-blue-800">{totalIncomeToday.toLocaleString('bn-BD')} ৳</p>
        </div>
        <div className="bg-red-100 p-5 rounded-lg shadow-md text-center">
          <p className="text-gray-700 text-lg font-semibold">মোট খরচ:</p>
          <p className="text-3xl font-bold text-red-800">{totalExpensesToday.toLocaleString('bn-BD')} ৳</p>
        </div>
        <div className="bg-purple-100 p-5 rounded-lg shadow-md text-center">
          <p className="text-gray-700 text-lg font-semibold">ফ্রি রোগী:</p>
          <p className="text-3xl font-bold text-purple-800">{freePatientsToday} জন</p>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-800 mt-10 mb-6 border-b pb-3">আজকের লেনদেন</h3>
      {transactions.length === 0 ? (
        <p className="text-gray-600 text-center py-8">আজকের কোনো লেনদেন নেই।</p>
      ) : (
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tl-lg">রোগীর নাম</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">কাজের বিবরণ</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">পরিমাণ (৳)</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tr-lg">পেমেন্ট পদ্ধতি</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-200 hover:bg-gray-50">
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

      <h3 className="text-2xl font-bold text-gray-800 mt-10 mb-6 border-b pb-3">আজকের খরচ</h3>
      {expenses.length === 0 ? (
        <p className="text-gray-600 text-center py-8">আজকের কোনো খরচ নেই।</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tl-lg">বিবরণ</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tr-lg">পরিমাণ (৳)</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-800">{exp.description}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{exp.amount.toLocaleString('bn-BD')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 