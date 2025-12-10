'use client';

import { useState, useEffect } from 'react';

export default function EditDocumentModal({ document, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState(''); 
  const [dateCreated, setDateCreated] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (document) {
      setTitle(document.title || '');
      setDateCreated(document.ai_date_created || '');
      setAuthors((document.ai_authors || []).join('; ')); 
    }
  }, [document]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    const authorsArray = authors.split(';').map(name => name.trim());
    try {
      await onSave(document.id, { title, ai_authors: authorsArray, ai_date_created: dateCreated });
      onClose(); 
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  if (!document) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-6 text-slate-900">Edit Document Metadata</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Authors (separated by semicolon)</label>
            <input type="text" value={authors} onChange={(e) => setAuthors(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Date Created</label>
            <input type="text" value={dateCreated} onChange={(e) => setDateCreated(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md disabled:bg-blue-300">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}