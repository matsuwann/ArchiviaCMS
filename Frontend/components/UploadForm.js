'use client';

import { useState } from 'react';
import axios from 'axios';


const authorFormatRegex = /^([A-Za-z'-]+,\s[A-Z]\.(?:\s?[A-Z]\.)?)(;\s[A-Za-z'-]+,\s[A-Z]\.(?:\s?[A-Z]\.)?)*$/;

export default function UploadForm({ onUploadSuccess }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [authorError, setAuthorError] = useState(''); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    if (!authorFormatRegex.test(author)) {
      setAuthorError('Invalid format. Please use: Lastname, F. M.; Lastname, S.');
      return; 
    }
   

    if (!file || !title || !author) {
      setMessage('Please fill in all fields and select a file.');
      return;
    }

    setAuthorError(''); 
    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:3001/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setMessage(`Success! Uploaded: ${response.data.title}`);
      setTitle('');
      setAuthor('');
      setFile(null);
      e.target.reset(); 
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      
      if (error.response && error.response.status === 400) {
        setMessage(`Upload failed: ${error.response.data.message}`);
      } else {
        setMessage('Upload failed. An unexpected error occurred.');
      }
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="p-6 mb-8 bg-slate-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload New Research Paper</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700">Author(s)</label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
            placeholder="e.g., Doe, J.; Smith, A."
          />
          
          {authorError && <p className="mt-1 text-sm text-red-600">{authorError}</p>}
        </div>
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">PDF Document</label>
          <input
            type="file"
            id="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept="application/pdf"
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
        >
          Upload
        </button>
      </form>
      {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
    </div>
  );
}