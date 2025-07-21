import { useState, useRef } from 'react';
import { numberToWordsBn, formatDate } from './ui/utils';

export default function BillGeneratorSection() {
  const [patientName, setPatientName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [age, setAge] = useState('');
  const [billItems, setBillItems] = useState([{ work: '', cost: '' }]);
  const [discount, setDiscount] = useState('');
  const [generatedBill, setGeneratedBill] = useState(null);
  const billRef = useRef();

  const handleAddItem = () => {
    setBillItems([...billItems, { work: '', cost: '' }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...billItems];
    newItems[index][field] = value;
    setBillItems(newItems);
  };

  const handleRemoveItem = (index) => {
    const newItems = billItems.filter((_, i) => i !== index);
    setBillItems(newItems);
  };

  const calculateTotal = () => {
    const subtotal = billItems.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);
    const totalDiscount = parseFloat(discount) || 0;
    return subtotal - totalDiscount;
  };

  const generateBill = () => {
    const totalAmount = calculateTotal();
    setGeneratedBill({
      date: formatDate(new Date()),
      patientName,
      address,
      age,
      mobileNumber,
      items: billItems.filter(item => item.work && item.cost),
      subtotal: billItems.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0),
      discount: parseFloat(discount) || 0,
      totalAmount,
      amountInWords: numberToWordsBn(totalAmount)
    });
  };

  const printBill = () => {
    if (generatedBill) {
      const printContents = billRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Reload to restore original page content and scripts
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">রোগীর বিল তৈরি</h2>

      <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-8">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">বিল তথ্য পূরণ করুন</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="billPatientName" className="block text-gray-800 text-sm font-semibold mb-2">রোগীর নাম:</label>
            <input
              type="text"
              id="billPatientName"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="billMobileNumber" className="block text-gray-800 text-sm font-semibold mb-2">মোবাইল নম্বর:</label>
            <input
              type="tel"
              id="billMobileNumber"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="billAddress" className="block text-gray-800 text-sm font-semibold mb-2">ঠিকানা:</label>
            <input
              type="text"
              id="billAddress"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="billAge" className="block text-gray-800 text-sm font-semibold mb-2">বয়স:</label>
            <input
              type="number"
              id="billAge"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="0"
            />
          </div>
        </div>

        <h4 className="text-xl font-semibold text-gray-700 mb-3">কাজের বিবরণ ও খরচ</h4>
        {billItems.map((item, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-3 mb-3">
            <input
              type="text"
              placeholder="কাজের বিবরণ"
              className="flex-grow p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              value={item.work}
              onChange={(e) => handleItemChange(index, 'work', e.target.value)}
            />
            <input
              type="number"
              placeholder="খরচ (৳)"
              className="w-full sm:w-32 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              value={item.cost}
              onChange={(e) => handleItemChange(index, 'cost', e.target.value)}
              min="0"
              step="0.01"
            />
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="p-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
            >
              মুছুন
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddItem}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 mb-4"
        >
          + আরও কাজ যোগ করুন
        </button>

        <div className="mb-4">
          <label htmlFor="discount" className="block text-gray-800 text-sm font-semibold mb-2">ডিসকাউন্ট (৳):</label>
          <input
            type="number"
            id="discount"
            className="w-full md:w-1/3 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>

        <button
          onClick={generateBill}
          className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105 font-semibold"
        >
          বিল তৈরি করুন
        </button>
      </div>

      {generatedBill && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">তৈরি করা বিল</h3>
          <div ref={billRef} className="bill-print-area p-6 border border-gray-300 rounded-lg bg-white">
            <h1 className="text-center text-3xl font-bold mb-4">গুড স্মাইল ডেন্টাল</h1>
            <p className="text-center text-gray-600 mb-6">আপনার দাঁতের যত্নে আমরা আছি পাশে</p>

            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <p><strong>তারিখ:</strong> {generatedBill.date}</p>
              <p><strong>রোগীর নাম:</strong> {generatedBill.patientName}</p>
              <p><strong>মোবাইল:</strong> {generatedBill.mobileNumber}</p>
              <p><strong>ঠিকানা:</strong> {generatedBill.address}</p>
              <p><strong>বয়স:</strong> {generatedBill.age}</p>
            </div>

            <table className="min-w-full border-collapse border border-gray-300 mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">ক্রমিক নং</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">কাজের বিবরণ</th>
                  <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">পরিমাণ (৳)</th>
                </tr>
              </thead>
              <tbody>
                {generatedBill.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2 text-sm">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">{item.work}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right text-sm">{parseFloat(item.cost).toLocaleString('bn-BD')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2" className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">মোট:</td>
                  <td className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">{generatedBill.subtotal.toLocaleString('bn-BD')}</td>
                </tr>
                <tr>
                  <td colSpan="2" className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">ডিসকাউন্ট:</td>
                  <td className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">{generatedBill.discount.toLocaleString('bn-BD')}</td>
                </tr>
                <tr className="bg-blue-50">
                  <td colSpan="2" className="border border-gray-300 px-4 py-2 text-right text-lg font-bold">সর্বমোট:</td>
                  <td className="border border-gray-300 px-4 py-2 text-right text-lg font-bold">{generatedBill.totalAmount.toLocaleString('bn-BD')} ৳</td>
                </tr>
              </tfoot>
            </table>
            <p className="text-sm font-semibold mb-4">টাকার পরিমাণ (কথায়): {generatedBill.amountInWords}</p>

            <p className="text-center text-xs text-gray-500 mt-8">ধন্যবাদ, আবার আসবেন!</p>
          </div>
          <button
            onClick={printBill}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 font-semibold mt-4"
          >
            বিল প্রিন্ট করুন
          </button>
        </div>
      )}
    </div>
  );
} 