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
      let authorsArray = document.ai_authors || [];
      setAuthors(authorsArray.join('; ')); 
    }
  }, [document]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const authorsArray = authors.split(';').map(name => name.trim());
    try {
      await onSave(document.id, { title, ai_authors: authorsArray, ai_date_created: dateCreated });
      onClose(); 
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Metadata</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Authors</label>
            <input
              type="text"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Author 1; Author 2"
            />
            <p className="text-xs text-gray-400 mt-1 ml-1">Separate multiple authors with a semicolon (;)</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Date Created</label>
            <input
              type="text"
              value={dateCreated}
              onChange={(e) => setDateCreated(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}