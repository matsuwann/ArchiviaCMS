'use client';

import { useState } from 'react';
import { uploadDocument } from '../services/apiService';

export default function UploadForm({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    setLoading(true); 
    setMessage('Processing... this may take a moment.');

    const formData = new FormData();
    formData.append('file', file);

    try { 
      const response = await uploadDocument(formData);
      
      setMessage(`Success! Uploaded: ${response.data.title}`);
      setFile(null);
      e.target.reset(); 
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(`Upload failed: ${error.response.data.message}`);
      } else {
        setMessage('Upload failed. An unexpected error occurred.');
      }
      console.error('Upload error:', error);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="p-6 mb-8 bg-slate-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload New Research Paper</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">PDF Document</label>
          <input
            type="file"
            id="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept="application/pdf"
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-7Am00 hover:file:bg-indigo-100"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading} 
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
        >
          {loading ? 'Processing...' : 'Upload and Analyze'}
        </button>
      </form>

      {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
    </div>
  );
}