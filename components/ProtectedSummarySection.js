'use client';

import { useState, useEffect, useRef } from 'react';
import MonthlySummarySection from './MonthlySummarySection';

export default function ProtectedSummarySection({ isAuthenticated, setIsAuthenticated }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null);
  const [shake, setShake] = useState(false);
  const passwordInputRef = useRef(null);
  
  const MAX_ATTEMPTS = 10;
  const LOCKOUT_DURATION = 30000; // 30 seconds

  useEffect(() => {
    // Check for lockout status
    const lockoutEnd = localStorage.getItem('lockoutEnd');
    if (lockoutEnd) {
      const remaining = parseInt(lockoutEnd) - Date.now();
      if (remaining > 0) {
        setIsLocked(true);
        setLockoutTime(Math.ceil(remaining / 1000));
      } else {
        localStorage.removeItem('lockoutEnd');
        localStorage.removeItem('loginAttempts');
      }
    }

    // Load saved attempts
    const savedAttempts = localStorage.getItem('loginAttempts');
    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts));
    }
  }, []);

  // Lockout timer
  useEffect(() => {
    if (isLocked && lockoutTime > 0) {
      const timer = setTimeout(() => {
        setLockoutTime(lockoutTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isLocked && lockoutTime === 0) {
      setIsLocked(false);
      setAttempts(0);
      localStorage.removeItem('lockoutEnd');
      localStorage.removeItem('loginAttempts');
    }
  }, [isLocked, lockoutTime]);

  // Focus password input when component mounts
  useEffect(() => {
    if (!isAuthenticated && passwordInputRef.current) {
      setTimeout(() => passwordInputRef.current?.focus(), 100);
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) {
      setError(`অনেক বেশি চেষ্টা করেছেন। ${lockoutTime} সেকেন্ড অপেক্ষা করুন।`);
      return;
    }

    if (!password.trim()) {
      setError('পাসওয়ার্ড প্রয়োজন');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate async validation (can be replaced with API call)
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === 'GSD-Admin123') {
      // Success
      setIsAuthenticated(true);
      localStorage.setItem('isSummaryAuthenticated', 'true');
      localStorage.setItem('authTimestamp', Date.now().toString());
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('lockoutEnd');
      setIsLoading(false);
      setPassword('');
      setAttempts(0);
    } else {
      // Failed attempt
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('loginAttempts', newAttempts.toString());
      
      if (newAttempts >= MAX_ATTEMPTS) {
        // Lock the user out
        const lockoutEnd = Date.now() + LOCKOUT_DURATION;
        localStorage.setItem('lockoutEnd', lockoutEnd.toString());
        setIsLocked(true);
        setLockoutTime(LOCKOUT_DURATION / 1000);
        setError(`অনেক বেশি চেষ্টা করেছেন। ${LOCKOUT_DURATION / 1000} সেকেন্ড অপেক্ষা করুন।`);
      } else {
        setError(`ভুল পাসওয়ার্ড। ${MAX_ATTEMPTS - newAttempts} টি চেষ্টা বাকি আছে।`);
      }
      
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPassword('');
      setIsLoading(false);
    }
  };

  // If authenticated, show the actual content
  if (isAuthenticated) {
    return <MonthlySummarySection />;
  }

  // Otherwise, show the password form inline
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div 
        className={`bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-2 border-gray-200 transform transition-all duration-300 ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">সুরক্ষিত এলাকা</h3>
            <p className="text-sm text-gray-500">অ্যাডমিন পাসওয়ার্ড প্রয়োজন</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all text-gray-900 ${
                  error 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                } ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="আপনার পাসওয়ার্ড লিখুন"
                disabled={isLoading || isLocked}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isLoading || isLocked}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Lockout Warning */}
          {isLocked && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-yellow-800 font-medium">অ্যাকাউন্ট সাময়িকভাবে লক করা হয়েছে</p>
                <p className="text-xs text-yellow-700 mt-1">অনুগ্রহ করে {lockoutTime} সেকেন্ড পরে আবার চেষ্টা করুন</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 flex items-center justify-center gap-2 ${
              isLoading || isLocked
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
            }`}
            disabled={isLoading || isLocked}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                যাচাই করা হচ্ছে...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                জমা দিন
              </>
            )}
          </button>
        </form>

        {/* Security Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            আপনার তথ্য সুরক্ষিত এবং এনক্রিপ্ট করা
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}
