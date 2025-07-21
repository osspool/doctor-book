'use client';

import { useState, useEffect } from 'react';

export default function ExpenseForm({ expense, onSubmit, onCancel, isLoading }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  // Pre-fill form when editing
  useEffect(() => {
    if (expense) {
      setDescription(expense.description || '');
      setAmount(expense.amount?.toString() || '');
    }
  }, [expense]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description || !amount) {
      alert('সব তথ্য পূরণ করুন।');
      return;
    }

    const formData = {
      description,
      amount: parseFloat(amount),
      date: expense?.date || new Date().toISOString().split('T')[0]
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
        <label className="block text-gray-800 text-sm font-semibold mb-2">খরচের বিবরণ:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
          required
        />
      </div>
      
      <div>
        <label className="block text-gray-800 text-sm font-semibold mb-2">পরিমাণ (টাকা):</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
          min="0"
          step="0.01"
          required
        />
      </div>
      
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:bg-red-300 font-semibold"
        >
          {isLoading ? 'আপডেট হচ্ছে...' : (expense ? 'আপডেট করুন' : 'যোগ করুন')}
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