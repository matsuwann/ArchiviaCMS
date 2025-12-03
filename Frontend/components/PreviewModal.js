'use client';
import { useEffect } from 'react';
import RelatedPapersWidget from './RelatedPapersWidget';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper to safely parse arrays from strings/JSON
const getSafeList = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
        try {
            // Try standard JSON parse
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            // Fallback: strip brackets and split by comma
            const cleaned = data.replace(/[\[\]"'{}]/g, '');
            return cleaned.split(',').map(s => s.trim()).filter(s => s);
        }
    }
    return [];
};

export default function PreviewModal({ document, allDocs, onSelectDoc, onClose }) {
  if (!document) return null;

  // Prevent background scrolling when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalStyle; };
  }, []);

  const handleDownload = () => {
    const url = `${API_URL}/documents/${document.id}/download`;
    window.open(url, '_blank');
  };

  const safeKeywords = getSafeList(document.ai_keywords);
  const safeAuthors = getSafeList(document.ai_authors);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in ring-1 ring-white/20">
        
        {/* Header */}
        <div className="flex-shrink-0 px-8 py-6 border-b border-gray-100 bg-white z-10 flex justify-between items-start gap-4">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wide">
                        {document.ai_journal || "Research Paper"}
                    </span>
                    <span className="text-gray-400 text-sm">• {document.ai_date_created}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                    {document.title}
                </h2>
                <p className="text-gray-500 font-medium mt-1">
                    {safeAuthors.join(', ')}
                </p>
            </div>
            <button 
                onClick={onClose}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-grow overflow-y-auto p-8 space-y-8 bg-gray-50/50">
            
            {/* Abstract */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                    Abstract
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                    {document.ai_abstract || "No abstract available."}
                </p>
            </section>

            {/* AI Insights / Summary if available */}
            {document.ai_summary && (
                <section className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                    <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-3">AI Analysis</h3>
                    <p className="text-indigo-900/80 leading-relaxed">
                        {document.ai_summary}
                    </p>
                </section>
            )}

            {/* Keywords */}
            {safeKeywords.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                        {safeKeywords.map((k, i) => (
                            <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-600 shadow-sm">
                                {k}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* WIDGET INTEGRATION */}
            <RelatedPapersWidget 
                currentDoc={document} 
                allDocs={allDocs} 
                onSelectDoc={onSelectDoc} 
            />
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 p-6 bg-white border-t border-gray-100 flex items-center justify-between gap-4">
            <div className="hidden sm:flex text-sm text-gray-400 gap-4">
                <span>ID: {document.id}</span>
                <span>Type: PDF</span>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
                <button 
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition shadow-sm"
                >
                    Close
                </button>
                <button 
                    onClick={handleDownload}
                    className="flex-1 sm:flex-none px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download PDF
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}