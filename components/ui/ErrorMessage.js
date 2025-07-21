'use client';

export default function ErrorMessage({ message = "ডেটা লোড করতে সমস্যা হয়েছে" }) {
  return (
    <div className="text-center py-8">
      <p className="text-red-500">{message}</p>
    </div>
  );
} 