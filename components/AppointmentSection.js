'use client';

import { useState, useCallback } from 'react';
import { useTodayAppointments, useAppointmentActions } from '@/hooks/useAppointments';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { formatDate, formatTime } from './utils';
import Modal from './Modal';
import AppointmentForm from './AppointmentForm';

export default function AppointmentSection() {
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  // Clinic hours and closed day
  const clinicHoursMorning = { start: 10, end: 13 }; // 10 AM to 1 PM
  const clinicHoursEvening = { start: 17, end: 21 }; // 5 PM to 9 PM
  const closedDay = 2; // Tuesday (0=Sunday, 1=Monday, ..., 6=Saturday)

  // Use hooks
  const { appointments, isLoading, error } = useTodayAppointments();
  const { 
    createAppointment, 
    updateAppointment, 
    deleteAppointment,
    isCreating,
    isUpdating,
    isDeleting
  } = useAppointmentActions();

  // Real-time updates (handled in the hook)
  useSupabaseRealtime('appointments', useCallback(() => {
    // Real-time invalidation is handled in the hooks
  }, []));

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(null);
    setMessage('');
  };

  const handleDelete = async (id) => {
    if (confirm('আপনি কি নিশ্চিত যে এই অ্যাপয়েন্টমেন্ট মুছে ফেলতে চান?')) {
      try {
        await deleteAppointment(id);
        setMessage('অ্যাপয়েন্টমেন্ট সফলভাবে মুছে ফেলা হয়েছে।');
      } catch (error) {
        setMessage('অ্যাপয়েন্টমেন্ট মুছতে ব্যর্থ।');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingAppointment) {
        // Update existing appointment (from modal)
        await updateAppointment({ id: editingAppointment.id, data: formData });
        setMessage('অ্যাপয়েন্টমেন্ট সফলভাবে আপডেট করা হয়েছে!');
        handleCloseModal();
      } else {
        // Create new appointment (from main form)
        await createAppointment(formData);
        setMessage('অ্যাপয়েন্টমেন্ট সফলভাবে যোগ করা হয়েছে!');
        // Don't close modal since this is the main form
      }
    } catch (error) {
      setMessage(editingAppointment ? 'অ্যাপয়েন্টমেন্ট আপডেট করতে ব্যর্থ।' : 'অ্যাপয়েন্টমেন্ট যোগ করতে ব্যর্থ।');
    }
  };

      return (
    <div className="p-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">নতুন অ্যাপয়েন্টমেন্ট</h2>
      
      {/* Create Form - Always Visible */}
      <div className="bg-blue-50 p-6 rounded-lg shadow-inner mb-8">
        <AppointmentForm
          appointment={null}
          onSubmit={handleFormSubmit}
          onCancel={() => setMessage('')}
          isLoading={isCreating}
        />
      </div>

      {message && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-md">
          {message}
        </div>
      )}

      <h2 className="text-3xl font-bold text-gray-800 mt-10 mb-6 border-b pb-3">আসন্ন অ্যাপয়েন্টমেন্ট (আজকের)</h2>
      
      {isLoading ? (
        <p className="text-gray-600 text-center py-8">লোড হচ্ছে...</p>
      ) : error ? (
        <p className="text-red-500 text-center py-8">ডেটা লোড করতে সমস্যা হয়েছে</p>
      ) : appointments.length === 0 ? (
        <p className="text-gray-600 text-center py-8">কোনো অ্যাপয়েন্টমেন্ট নেই।</p>
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
              {appointments.map((appt) => (
                <tr key={appt.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-800">{formatDate(appt.appointment_date)}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{formatTime(appt.appointment_time)}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{appt.patient_name}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{appt.mobile_number}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{appt.work_description}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(appt)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium"
                        title="সম্পাদনা"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(appt.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium"
                        title="মুছুন"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-gray-600 text-sm mt-4 text-center">
        চেম্বার সকাল ১০টা থেকে দুপুর ১টা এবং বিকাল ৫টা থেকে রাত ৯টা পর্যন্ত খোলা। মঙ্গলবার বন্ধ।
      </p>

      {/* Edit Modal - Only for Updates */}
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