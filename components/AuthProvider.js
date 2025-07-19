'use client';

import { useState, useEffect } from 'react';

const CORRECT_PASSWORD = 'admin123'; // Updated password
const AUTH_KEY = 'dental_clinic_auth';

export default function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Check localStorage on component mount
  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_KEY);
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError('');
      localStorage.setItem(AUTH_KEY, 'true');
    } else {
      setLoginError('ভুল পাসওয়ার্ড।');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    localStorage.removeItem(AUTH_KEY);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg font-semibold text-gray-700">লোড হচ্ছে...</div>
      </div>
    );
  }

  // Simple password gate for the UI
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-teal-500">
        <div className="bg-white p-8 rounded-lg shadow-xl w-96 text-center">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-6">গুড স্মাইল ডেন্টাল</h2>
          <p className="text-gray-600 mb-4">প্রবেশ করতে পাসওয়ার্ড দিন।</p>
          <input
            type="password"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 bg-white text-gray-900"
            placeholder="পাসওয়ার্ড"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleLogin();
            }}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            প্রবেশ করুন
          </button>
          {loginError && <p className="text-red-500 mt-3 text-sm">{loginError}</p>}
        </div>
      </div>
    );
  }

  return children({ onLogout: handleLogout });
} 