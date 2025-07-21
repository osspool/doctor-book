'use client';

export default function LoadingSpinner({ message = "লোড হচ্ছে..." }) {
  return (
    <div className="text-center py-8">
      <div className="inline-flex items-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
} 