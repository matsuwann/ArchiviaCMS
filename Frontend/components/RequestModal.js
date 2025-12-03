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
    onSubmit(reason);
    setReason(""); 
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in border border-white/20">
        <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <div className="text-gray-500 mt-1 text-sm leading-relaxed">
            {message}
            </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 mb-4 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px] text-sm shadow-inner transition-all"
            placeholder="Please provide a reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose} 
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-bold text-sm transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`px-6 py-2 text-white rounded-lg font-bold text-sm shadow-md transition-all transform active:scale-95 ${confirmColor} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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