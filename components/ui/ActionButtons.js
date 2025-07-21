'use client';

export default function ActionButtons({ onEdit, onDelete, editTitle = "Edit", deleteTitle = "Delete" }) {
  return (
    <div className="flex gap-1">
      <button
        onClick={onEdit}
        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
        title={editTitle}
      >
        ✏️
      </button>
      <button
        onClick={onDelete}
        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
        title={deleteTitle}
      >
        🗑️
      </button>
    </div>
  );
} 