'use client';
import { useState } from 'react';

export default function RequestModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title = "Request Action", 
  message, 
  actionLabel = "Confirm",
  confirmColor = "bg-red-600 hover:bg-red-700",
  isLoading = false 
}) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass the reason up to the parent component
    onSubmit(reason);
    setReason(""); // Reset internal state
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <div className="text-gray-600 mb-4 text-sm">
          {message}
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full border border-gray-300 rounded p-2 mb-4 focus:ring-2 ring-indigo-500 outline-none min-h-[100px]"
            placeholder="Please provide a reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2">
            <button 
              type="button"
              onClick={onClose} 
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`px-4 py-2 text-white rounded font-medium shadow-sm ${confirmColor} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : actionLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}