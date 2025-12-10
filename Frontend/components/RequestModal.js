'use client';
import { useState } from 'react';

export default function RequestModal({ isOpen, onClose, onSubmit, title = "Request Action", message, actionLabel = "Confirm", confirmColor = "bg-red-600 hover:bg-red-700", isLoading = false }) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(reason);
    setReason("");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl scale-100 transition-transform">
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <div className="text-slate-600 mb-4 text-sm">{message}</div>
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 mb-4 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all min-h-[100px] text-sm"
            placeholder="Please provide a valid reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold transition" disabled={isLoading}>Cancel</button>
            <button type="submit" className={`px-4 py-2 text-white rounded-lg font-bold shadow-md transition ${confirmColor} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isLoading}>
              {isLoading ? 'Processing...' : actionLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}