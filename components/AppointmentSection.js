'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAppointments, createAppointment } from '@/app/actions/appointments';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { formatDate, formatTime } from './utils';

export default function AppointmentSection() {
  const [appointments, setAppointments] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Clinic hours and closed day
  const clinicHoursMorning = { start: 10, end: 13 }; // 10 AM to 1 PM
  const clinicHoursEvening = { start: 17, end: 21 }; // 5 PM to 9 PM
  const closedDay = 2; // Tuesday (0=Sunday, 1=Monday, ..., 6=Saturday)

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const result = await getAppointments(today);
    
    if (result.error) {
      setMessage('অ্যাপয়েন্টমেন্ট লোড করতে ব্যর্থ।');
    } else {
      setAppointments(result.data || []);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Real-time updates
  useSupabaseRealtime('appointments', useCallback((payload) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
      fetchAppointments();
    }
  }, [fetchAppointments]));

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!patientName || !mobileNumber || !workDescription || !appointmentDate || !appointmentTime) {
      setMessage('সব তথ্য পূরণ করুন।');
      return;
    }

    const selectedDate = new Date(appointmentDate);
    const dayOfWeek = selectedDate.getDay();
    const [hours] = appointmentTime.split(':').map(Number);

    // Check for closed day
    if (dayOfWeek === closedDay) {
      setMessage('মঙ্গলবার চেম্বার বন্ধ থাকে।');
      return;
    }

    // Check for clinic hours
    const isMorningHours = hours >= clinicHoursMorning.start && hours < clinicHoursMorning.end;
    const isEveningHours = hours >= clinicHoursEvening.start && hours < clinicHoursEvening.end;

    if (!isMorningHours && !isEveningHours) {
      setMessage('চেম্বার সকাল ১০টা-১টা এবং বিকাল ৫টা-৯টা পর্যন্ত খোলা থাকে।');
      return;
    }

    setLoading(true);
    try {
      const result = await createAppointment({
        patient_name: patientName,
        mobile_number: mobileNumber,
        work_description: workDescription,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime
      });

      if (result.error) {
        setMessage('অ্যাপয়েন্টমেন্ট যোগ করতে ব্যর্থ।');
      } else {
        setMessage('অ্যাপয়েন্টমেন্ট সফলভাবে যোগ করা হয়েছে!');
        setPatientName('');
        setMobileNumber('');
        setWorkDescription('');
        setAppointmentDate('');
        setAppointmentTime('');
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error adding appointment:', error);
      setMessage('অ্যাপয়েন্টমেন্ট যোগ করতে ব্যর্থ।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">নতুন অ্যাপয়েন্টমেন্ট</h2>
      <form onSubmit={handleAddAppointment} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 p-6 rounded-lg shadow-inner">
        <div>
          <label htmlFor="patientName" className="block text-gray-800 text-sm font-semibold mb-2">রোগীর নাম:</label>
          <input
            type="text"
            id="patientName"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="mobileNumber" className="block text-gray-800 text-sm font-semibold mb-2">মোবাইল নম্বর:</label>
          <input
            type="tel"
            id="mobileNumber"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="workDescription" className="block text-gray-800 text-sm font-semibold mb-2">কি কাজ করা হবে:</label>
          <textarea
            id="workDescription"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            rows="3"
            value={workDescription}
            onChange={(e) => setWorkDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="appointmentDate" className="block text-gray-800 text-sm font-semibold mb-2">তারিখ:</label>
          <input
            type="date"
            id="appointmentDate"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="appointmentTime" className="block text-gray-800 text-sm font-semibold mb-2">সময়:</label>
          <input
            type="time"
            id="appointmentTime"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'যোগ করা হচ্ছে...' : 'অ্যাপয়েন্টমেন্ট যোগ করুন'}
          </button>
        </div>
        {message && <p className="md:col-span-2 text-center text-sm mt-2 text-blue-600">{message}</p>}
      </form>

      <h2 className="text-3xl font-bold text-gray-800 mt-10 mb-6 border-b pb-3">আসন্ন অ্যাপয়েন্টমেন্ট (আজকের)</h2>
      {appointments.length === 0 ? (
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
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 rounded-tr-lg">কাজের বিবরণ</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-gray-600 text-sm mt-4 text-center">
        চেম্বার সকাল ১০টা থেকে দুপুর ১টা এবং বিকাল ৫টা থেকে রাত ৯টা পর্যন্ত খোলা। মঙ্গলবার বন্ধ।
      </p>
    </div>
  );
} 