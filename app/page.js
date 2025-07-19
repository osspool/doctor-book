'use client';

import { useState } from 'react';
import AuthProvider from '../components/AuthProvider';
import Navigation from '../components/Navigation';
import AppointmentSection from '../components/AppointmentSection';
import MonthlyAppointmentSection from '../components/MonthlyAppointmentSection';
import TransactionSection from '../components/TransactionSection';
import MonthlySummarySection from '../components/MonthlySummarySection';
import BillGeneratorSection from '../components/BillGeneratorSection';

export default function Home() {
  const [activeTab, setActiveTab] = useState('appointments');

  return (
    <AuthProvider>
      {({ onLogout }) => (
        <div className="min-h-screen bg-gray-100 font-inter">
          <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-lg shadow-lg mb-8">
              <div className="flex items-center justify-between mb-4">
                <div></div>
                <h1 className="text-4xl font-extrabold text-center">🦷 গুড স্মাইল ডেন্টাল</h1>
                <button
                  onClick={onLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition duration-200 ease-in-out"
                  title="লগআউট"
                >
                  লগআউট
                </button>
              </div>
              <p className="text-center text-lg">রোগী ব্যবস্থাপনা এবং আর্থিক হিসাব</p>
            </header>

            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="bg-white p-6 rounded-lg shadow-lg">
              {activeTab === 'appointments' && <AppointmentSection />}
              {activeTab === 'monthlyAppointments' && <MonthlyAppointmentSection />}
              {activeTab === 'transactions' && <TransactionSection />}
              {activeTab === 'summary' && <MonthlySummarySection />}
              {activeTab === 'bill' && <BillGeneratorSection />}
            </main>
          </div>
        </div>
      )}
    </AuthProvider>
  );
}
