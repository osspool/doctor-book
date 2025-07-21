'use client';

import { useState, useEffect } from 'react';

export default function TransactionForm({ transaction, onSubmit, onCancel, isLoading }) {
  const [patientName, setPatientName] = useState('');
  const [workDone, setWorkDone] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isFree, setIsFree] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (transaction) {
      setPatientName(transaction.patient_name || '');
      setWorkDone(transaction.work_done || '');
      setAmountPaid(transaction.amount_paid?.toString() || '');
      setPaymentMethod(transaction.payment_method || 'Cash');
      setIsFree(transaction.is_free || false);
    }
  }, [transaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientName || !workDone || (!isFree && !amountPaid)) {
      alert('সব তথ্য পূরণ করুন।');
      return;
    }

    const formData = {
      patient_name: patientName,
      work_done: workDone,
      amount_paid: isFree ? 0 : parseFloat(amountPaid),
      payment_method: isFree ? 'Free' : paymentMethod,
      is_free: isFree,
      date: transaction?.date || new Date().toISOString().split('T')[0]
    };

    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-800 text-sm font-semibold mb-2">রোগীর নাম:</label>
        <input
          type="text"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          required
        />
      </div>
      
      <div>
        <label className="block text-gray-800 text-sm font-semibold mb-2">কি কাজ হলো:</label>
        <textarea
          value={workDone}
          onChange={(e) => setWorkDone(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          rows="2"
          required
        />
      </div>
      
      <div>
        <label className="block text-gray-800 text-sm font-semibold mb-2">কত টাকা দিলো:</label>
        <input
          type="number"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:bg-gray-100"
          min="0"
          step="0.01"
          disabled={isFree}
          required={!isFree}
        />
      </div>
      
      <div>
        <label className="block text-gray-800 text-sm font-semibold mb-2">পেমেন্ট পদ্ধতি:</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:bg-gray-100"
          disabled={isFree}
          required={!isFree}
        >
          <option value="Cash">ক্যাশ</option>
          <option value="bKash">বিকাশ</option>
          <option value="Online">অনলাইন</option>
          <option value="Free">ফ্রি</option>
        </select>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={isFree}
          onChange={(e) => setIsFree(e.target.checked)}
          className="mr-2 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
        />
        <label className="text-gray-800 text-sm font-semibold">ফ্রি রোগী</label>
      </div>
      
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 font-semibold"
        >
          {isLoading ? 'আপডেট হচ্ছে...' : (transaction ? 'আপডেট করুন' : 'যোগ করুন')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 font-semibold"
        >
          বাতিল
        </button>
      </div>
    </form>
  );
} 