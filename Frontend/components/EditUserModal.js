'use client';

import { useState, useEffect } from 'react';

export default function EditUserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', is_admin: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setFormData({ first_name: user.first_name || '', last_name: user.last_name || '', email: user.email || '', is_admin: user.is_admin || false });
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await onSave(user.id, formData); onClose(); } 
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-6 text-slate-900">Edit User Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">First Name</label>
              <input name="first_name" value={formData.first_name} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Last Name</label>
              <input name="last_name" value={formData.last_name} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
            <input name="email" value={formData.email} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
            <input type="checkbox" id="is_admin" name="is_admin" checked={formData.is_admin} onChange={handleChange} className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
            <label htmlFor="is_admin" className="ml-3 block text-sm font-semibold text-slate-700">Grant Administrator Privileges</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md disabled:bg-indigo-300">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}