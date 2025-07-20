'use client';

import { useState, useEffect } from 'react';

export default function AppointmentForm({ 
  appointment = null, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) {
  const [patientName, setPatientName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  // Clinic hours and closed day
  const clinicHoursMorning = { start: 10, end: 13 }; // 10 AM to 1 PM
  const clinicHoursEvening = { start: 17, end: 21 }; // 5 PM to 9 PM
  const closedDay = 2; // Tuesday

  // Fill form when editing
  useEffect(() => {
    if (appointment) {
      setPatientName(appointment.patient_name || '');
      setMobileNumber(appointment.mobile_number || '');
      setWorkDescription(appointment.work_description || '');
      setAppointmentDate(appointment.appointment_date || '');
      setAppointmentTime(appointment.appointment_time || '');
    }
  }, [appointment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!patientName || !mobileNumber || !workDescription || !appointmentDate || !appointmentTime) {
      alert('সব তথ্য পূরণ করুন।');
      return;
    }

    const selectedDate = new Date(appointmentDate);
    const dayOfWeek = selectedDate.getDay();
    const [hours] = appointmentTime.split(':').map(Number);

    // Check for closed day
    if (dayOfWeek === closedDay) {
      alert('মঙ্গলবার চেম্বার বন্ধ থাকে।');
      return;
    }

    // Check for clinic hours
    const isMorningHours = hours >= clinicHoursMorning.start && hours < clinicHoursMorning.end;
    const isEveningHours = hours >= clinicHoursEvening.start && hours < clinicHoursEvening.end;

    if (!isMorningHours && !isEveningHours) {
      alert('চেম্বার সকাল ১০টা-১টা এবং বিকাল ৫টা-৯টা পর্যন্ত খোলা থাকে।');
      return;
    }

    const formData = {
      patient_name: patientName,
      mobile_number: mobileNumber,
      work_description: workDescription,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime
    };

    try {
      await onSubmit(formData);
      
      // Clear form only if this is a new appointment (not editing)
      if (!appointment) {
        setPatientName('');
        setMobileNumber('');
        setWorkDescription('');
        setAppointmentDate('');
        setAppointmentTime('');
      }
    } catch (error) {
      // Error is handled by parent component
    }
  };

  const handleCancel = () => {
    setPatientName('');
    setMobileNumber('');
    setWorkDescription('');
    setAppointmentDate('');
    setAppointmentTime('');
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="patientName" className="block text-gray-800 text-sm font-semibold mb-2">
          রোগীর নাম:
        </label>
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
        <label htmlFor="mobileNumber" className="block text-gray-800 text-sm font-semibold mb-2">
          মোবাইল নম্বর:
        </label>
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
        <label htmlFor="workDescription" className="block text-gray-800 text-sm font-semibold mb-2">
          কি কাজ করা হবে:
        </label>
        <textarea
          id="workDescription"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          rows="3"
          value={workDescription}
          onChange={(e) => setWorkDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="appointmentDate" className="block text-gray-800 text-sm font-semibold mb-2">
          তারিখ:
        </label>
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
        <label htmlFor="appointmentTime" className="block text-gray-800 text-sm font-semibold mb-2">
          সময়:
        </label>
        <input
          type="time"
          id="appointmentTime"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          value={appointmentTime}
          onChange={(e) => setAppointmentTime(e.target.value)}
          required
        />
      </div>

      <div className="md:col-span-2 flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (appointment ? 'আপডেট করা হচ্ছে...' : 'যোগ করা হচ্ছে...') : (appointment ? 'আপডেট করুন' : 'অ্যাপয়েন্টমেন্ট যোগ করুন')}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 bg-gray-500 text-white py-3 rounded-md hover:bg-gray-600 transition duration-300 ease-in-out font-semibold"
        >
          বাতিল
        </button>
      </div>
    </form>
  );
} 