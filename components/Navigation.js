import { useState, useEffect } from 'react';

export default function Navigation({ activeTab, setActiveTab, isAuthenticated, setIsAuthenticated }) {
  useEffect(() => {
    // Check if user is already authenticated and session is valid
    const authStatus = localStorage.getItem('isSummaryAuthenticated');
    const authTimestamp = localStorage.getItem('authTimestamp');
    
    if (authStatus === 'true' && authTimestamp) {
      const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
      const elapsed = Date.now() - parseInt(authTimestamp);
      if (elapsed < SESSION_DURATION) {
        setIsAuthenticated(true);
      } else {
        // Session expired
        localStorage.removeItem('isSummaryAuthenticated');
        localStorage.removeItem('authTimestamp');
      }
    }
  }, [setIsAuthenticated]);

  // const handleLogout = () => {
  //   setIsAuthenticated(false);
  //   localStorage.removeItem('isSummaryAuthenticated');
  //   localStorage.removeItem('authTimestamp');
  //   if (activeTab === 'summary') {
  //     setActiveTab('appointments');
  //   }
  // };

  const tabs = [
    { id: 'appointments', label: 'অ্যাপয়েন্টমেন্ট' },
    { id: 'monthlyAppointments', label: 'মাসিক অ্যাপয়েন্টমেন্ট' },
    { id: 'transactions', label: 'দৈনিক লেনদেন' },
    { id: 'summary', label: 'মাসিক সারসংক্ষেপ', protected: true },
    { id: 'bill', label: 'বিল তৈরি' }
  ];

  return (
    <div>
      <nav className="mb-8">
        <div className="flex flex-wrap justify-center items-center gap-4">
          <ul className="flex flex-wrap justify-center gap-4">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                  }`}
                >
                  {tab.label}
                  {tab.protected && !isAuthenticated && (
                    <span className="ml-2 text-xs">🔒</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          
          {/* Logout button when authenticated */}
          {/* {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-300 border border-red-200"
              title="লগআউট করুন"
            >
              🔒 লগআউট
            </button>
          )} */}
        </div>
      </nav>
    </div>
  );
} 