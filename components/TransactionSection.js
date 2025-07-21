'use client';

import { useState, useCallback } from 'react';
import { 
  useTransactionsByDate,
  useExpensesByDate,
  useTransactionActions,
  useExpenseActions
} from '@/hooks/useTransactions';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { formatDate } from './ui/utils';
import Modal from './ui/Modal';
import TransactionForm from './forms/TransactionForm';
import ExpenseForm from './forms/ExpenseForm';
import ActionButtons from './ui/ActionButtons';
import LoadingSpinner from './ui/LoadingSpinner';
import ErrorMessage from './ui/ErrorMessage';
import SuccessMessage from './ui/SuccessMessage';

export default function TransactionSection() {
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
  
  // Modal states
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  // Use hooks
  const { transactions, isLoading: transactionsLoading, error: transactionsError } = useTransactionsByDate(transactionDate);
  const { expenses, isLoading: expensesLoading, error: expensesError } = useExpensesByDate(transactionDate);
  const { createTransaction, updateTransaction, deleteTransaction, isCreating: isCreatingTransaction, isUpdating: isUpdatingTransaction } = useTransactionActions();
  const { createExpense, updateExpense, deleteExpense, isCreating: isCreatingExpense, isUpdating: isUpdatingExpense } = useExpenseActions();

  // Real-time updates (handled in hooks)
  useSupabaseRealtime('transactions', useCallback(() => {
    // Real-time invalidation is handled in the hooks
  }, []));

  useSupabaseRealtime('expenses', useCallback(() => {
    // Real-time invalidation is handled in the hooks
  }, []));

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setTransactionMessage('');

    if (!patientName || !workDone || (!isFree && !amountPaid)) {
      setTransactionMessage('সব তথ্য পূরণ করুন।');
      return;
    }

    try {
      await createTransaction({
        date: transactionDate,
        patient_name: patientName,
        work_done: workDone,
        amount_paid: isFree ? 0 : parseFloat(amountPaid),
        payment_method: isFree ? 'Free' : paymentMethod,
        is_free: isFree
      });

      setTransactionMessage('লেনদেন সফলভাবে যোগ করা হয়েছে!');
      setPatientName('');
      setWorkDone('');
      setAmountPaid('');
      setIsFree(false);
    } catch (error) {
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
      await createExpense({
        date: transactionDate,
        description: expenseDescription,
        amount: parseFloat(expenseAmount)
      });

      setExpenseMessage('খরচ সফলভাবে যোগ করা হয়েছে!');
      setExpenseDescription('');
      setExpenseAmount('');
    } catch (error) {
      setExpenseMessage('খরচ যোগ করতে ব্যর্থ।');
    }
  };

  // Transaction edit/delete handlers
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleDeleteTransaction = async (id) => {
    if (confirm('আপনি কি নিশ্চিত যে এই লেনদেন মুছে ফেলতে চান?')) {
      try {
        await deleteTransaction(id);
        setTransactionMessage('লেনদেন সফলভাবে মুছে ফেলা হয়েছে।');
      } catch (error) {
        setTransactionMessage('লেনদেন মুছতে ব্যর্থ।');
      }
    }
  };

  const handleUpdateTransaction = async (formData) => {
    try {
      await updateTransaction({ id: editingTransaction.id, data: formData });
      setTransactionMessage('লেনদেন সফলভাবে আপডেট করা হয়েছে!');
      setIsTransactionModalOpen(false);
      setEditingTransaction(null);
    } catch (error) {
      setTransactionMessage('লেনদেন আপডেট করতে ব্যর্থ।');
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
        setExpenseMessage('খরচ সফলভাবে মুছে ফেলা হয়েছে।');
      } catch (error) {
        setExpenseMessage('খরচ মুছতে ব্যর্থ।');
      }
    }
  };

  const handleUpdateExpense = async (formData) => {
    try {
      await updateExpense({ id: editingExpense.id, data: formData });
      setExpenseMessage('খরচ সফলভাবে আপডেট করা হয়েছে!');
      setIsExpenseModalOpen(false);
      setEditingExpense(null);
    } catch (error) {
      setExpenseMessage('খরচ আপডেট করতে ব্যর্থ।');
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
      {transactionsLoading ? (
        <p className="text-center text-gray-600 py-8">লোড হচ্ছে...</p>
      ) : transactionsError ? (
        <p className="text-center text-red-500 py-8">ডেটা লোড করতে সমস্যা হয়েছে</p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-600 text-center py-8">আজকের কোনো লেনদেন নেই।</p>
      ) : (
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tl-lg">রোগীর নাম</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">কাজের বিবরণ</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">পরিমাণ (৳)</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">পেমেন্ট পদ্ধতি</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tr-lg">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-200 hover:bg-gray-50">
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

      <h3 className="text-2xl font-bold text-gray-800 mt-10 mb-6 border-b pb-3">আজকের খরচ</h3>
      {expensesLoading ? (
        <p className="text-center text-gray-600 py-8">লোড হচ্ছে...</p>
      ) : expensesError ? (
        <p className="text-center text-red-500 py-8">ডেটা লোড করতে সমস্যা হয়েছে</p>
      ) : expenses.length === 0 ? (
        <p className="text-gray-600 text-center py-8">আজকের কোনো খরচ নেই।</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tl-lg">বিবরণ</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">পরিমাণ (৳)</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tr-lg">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id} className="border-b border-gray-200 hover:bg-gray-50">
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