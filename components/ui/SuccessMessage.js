'use client';

export default function SuccessMessage({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-md relative">
      {message}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-1 right-2 text-blue-600 hover:text-blue-800 text-lg"
        >
          ×
        </button>
      )}
    </div>
  );
} 