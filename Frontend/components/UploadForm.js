'use client';

import { useState } from 'react';
import { uploadDocument } from '../services/apiService';
import { toast } from 'react-hot-toast'; 

export default function UploadForm({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload.'); 
      return;
    }
    setLoading(true); 
    const formData = new FormData();
    formData.append('file', file);

    const uploadPromise = uploadDocument(formData);

    toast.promise(uploadPromise, {
        loading: 'Analyzing document structure & extracting metadata...',
        success: (response) => {
          setFile(null);
          e.target.reset(); 
          if (onUploadSuccess) onUploadSuccess();
          return `Successfully uploaded: ${response.data.title}`;
        },
        error: (error) => error.response?.data?.message || 'Upload failed.'
    }).finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className="glass-panel p-8 rounded-2xl shadow-xl border border-white/40">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Upload Paper</h2>
        <p className="text-gray-500 text-sm mt-1">PDF format only. AI will auto-extract details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
            <input
                type="file"
                id="file"
                onChange={(e) => setFile(e.target.files[0])}
                accept="application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                required
            />
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${file ? 'border-green-400 bg-green-50' : 'border-indigo-200 bg-indigo-50/50 group-hover:bg-indigo-50 group-hover:border-indigo-400'}`}>
                {file ? (
                    <div className="text-green-700 font-medium flex flex-col items-center gap-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>{file.name}</span>
                        <span className="text-xs text-green-600">Ready to upload</span>
                    </div>
                ) : (
                    <div className="text-gray-500 flex flex-col items-center gap-2">
                        <span className="font-semibold text-indigo-600 group-hover:underline">Click to browse</span>
                        <span className="text-xs">or drag and drop PDF file here</span>
                    </div>
                )}
            </div>
        </div>

        <button
          type="submit"
          disabled={loading} 
          className="w-full py-4 px-6 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
        >
          {loading ? 'Processing Document...' : 'Start Analysis & Upload'}
        </button>
      </form>
    </div>
  );
}