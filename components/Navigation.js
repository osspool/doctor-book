export default function Navigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'appointments', label: 'অ্যাপয়েন্টমেন্ট' },
    { id: 'monthlyAppointments', label: 'মাসিক অ্যাপয়েন্টমেন্ট' },
    { id: 'transactions', label: 'দৈনিক লেনদেন' },
    { id: 'summary', label: 'মাসিক সারসংক্ষেপ' },
    { id: 'bill', label: 'বিল তৈরি' }
  ];

  return (
    <nav className="mb-8">
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
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
} 