'use client';

import { useState, useCallback } from 'react';
import { useMonthlyAppointments, useAppointmentActions } from '@/hooks/useAppointments';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { formatDate, formatTime } from './ui/utils';
import Modal from './ui/Modal';
import AppointmentForm from './forms/AppointmentForm';

export default function MonthlyAppointmentSection() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM format
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  // Parse selected month
  const [year, month] = selectedMonth.split('-').map(Number);
  
  // Use hooks
  const { appointments: monthlyAppointments, isLoading, error } = useMonthlyAppointments(year, month);
  const { updateAppointment, deleteAppointment, isUpdating } = useAppointmentActions();

  // Real-time updates (handled in hooks)
  useSupabaseRealtime('appointments', useCallback(() => {
    // Real-time invalidation is handled in the hooks
  }, []));

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      await updateAppointment({ id: editingAppointment.id, data: formData });
      setMessage('অ্যাপয়েন্টমেন্ট আপডেট হয়েছে');
      handleCloseModal();
    } catch (error) {
      setMessage('আপডেট করতে সমস্যা হয়েছে');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
  };

  const handleDelete = async (id) => {
    if (confirm('আপনি কি নিশ্চিত যে এই অ্যাপয়েন্টমেন্ট মুছে ফেলতে চান?')) {
      try {
        await deleteAppointment(id);
        setMessage('অ্যাপয়েন্টমেন্ট মুছে ফেলা হয়েছে');
      } catch (error) {
        setMessage('মুছতে সমস্যা হয়েছে');
      }
    }
  };

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

      {message && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-md">
          {message}
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-gray-600 py-8">লোড হচ্ছে...</p>
      ) : error ? (
        <p className="text-center text-red-500 py-8">ডেটা লোড করতে সমস্যা হয়েছে</p>
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
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">কাজের বিবরণ</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tr-lg">কার্যক্রম</th>
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
                  <td className="py-3 px-4 text-sm text-gray-800">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(appt)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(appt.id)}
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

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="অ্যাপয়েন্টমেন্ট সম্পাদনা"
      >
        <AppointmentForm
          appointment={editingAppointment}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          isLoading={isUpdating}
        />
      </Modal>
    </div>
  );
} 