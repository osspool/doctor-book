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

  // Pre-fill form when editing
  useEffect(() => {
    if (appointment) {
      setPatientName(appointment.patient_name || '');
      setMobileNumber(appointment.mobile_number || '');
      setWorkDescription(appointment.work_description || '');
      setAppointmentDate(appointment.appointment_date || '');
      setAppointmentTime(appointment.appointment_time || '');
    } else {
      // Clear form for new appointments
      setPatientName('');
      setMobileNumber('');
      setWorkDescription('');
      setAppointmentDate('');
      setAppointmentTime('');
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* First row: Patient Name & Mobile Number */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-gray-800 text-sm font-semibold mb-2">রোগীর নাম:</label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-800 text-sm font-semibold mb-2">মোবাইল নম্বর:</label>
          <input
            type="text"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            required
          />
        </div>
      </div>

      {/* Work Description (full width) */}
      <div>
        <label className="block text-gray-800 text-sm font-semibold mb-2">কাজের বিবরণ:</label>
        <textarea
          value={workDescription}
          onChange={(e) => setWorkDescription(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          rows="2"
          required
        />
      </div>

      {/* Last row: Date & Time */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-gray-800 text-sm font-semibold mb-2">তারিখ:</label>
          <input
            type="date"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-800 text-sm font-semibold mb-2">সময়:</label>
          <input
            type="time"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            required
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-blue-300 font-semibold transition duration-300 ease-in-out transform hover:scale-105"
        >
          {isLoading ? 'যোগ হচ্ছে...' : (appointment ? 'আপডেট করুন' : 'অ্যাপয়েন্টমেন্ট যোগ করুন')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-600 text-white py-3 rounded-md hover:bg-gray-700 font-semibold transition duration-300 ease-in-out"
          >
            বাতিল
          </button>
        )}
      </div>
    </form>
  );
} 