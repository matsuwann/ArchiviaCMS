'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast'; 

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

      await onSave(document.id, {
        title,
        ai_authors: authorsArray,
        ai_date_created: dateCreated,
      });
      onClose(); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Edit Document</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="authors" className="block text-sm font-medium text-gray-700">Authors</label>
            <input
              type="text"
              id="authors"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="e.g., Doe, J.; Smith, A."
            />
            <p className="text-xs text-gray-500 mt-1">Use a semicolon (;) to separate authors.</p>
          </div>
          <div>
            <label htmlFor="dateCreated" className="block text-sm font-medium text-gray-700">Date Created</label>
            <input
              type="text"
              id="dateCreated"
              value={dateCreated}
              onChange={(e) => setDateCreated(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="e.g., 2024-05"
            />
          </div>
          
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}