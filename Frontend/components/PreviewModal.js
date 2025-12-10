'use client';
import { useState, useEffect } from 'react';
import RelatedPapersWidget from './RelatedPapersWidget';

const getSafeList = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
        const cleaned = data.replace(/[\[\]"'{}]/g, '');
        return cleaned.split(',').map(s => s.trim()).filter(s => s);
    }
    return [];
};

export default function PreviewModal({ document: activeDoc, onClose, allDocs, onSelectDoc }) {
  const [showAbstract, setShowAbstract] = useState(false);

  // === NEW: Instantly reset view to top when document changes ===
  useEffect(() => {
    const scrollContainer = document.getElementById('modal-content');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, [activeDoc]); // Triggers whenever activeDoc updates

  if (!activeDoc) return null;

  const previewUrls = getSafeList(activeDoc.preview_urls);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden ring-1 ring-white/20">
        
        {/* === HEADER === */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 z-10">
          <div className="flex items-center gap-4 overflow-hidden">
             <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
             </div>
             <h2 className="text-lg font-bold text-slate-800 truncate">{activeDoc.title || "Untitled Document"}</h2>
             
             {/* TOGGLE BUTTON */}
             <button 
               onClick={() => setShowAbstract(!showAbstract)}
               className={`ml-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-2
                 ${showAbstract 
                   ? 'bg-slate-900 text-white border-slate-900' 
                   : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
             >
               {showAbstract ? 'Show Abstract' : 'Hide Abstract'}
             </button>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* === MAIN CONTENT AREA (SPLIT VIEW) === */}
        <div className="flex flex-1 overflow-hidden relative bg-slate-50">
            
            {/* LEFT: SCROLLABLE PDF PREVIEW */}
            <div className="flex-1 overflow-y-auto p-8 scroll-smooth" id="modal-content">
                <div className="max-w-3xl mx-auto flex flex-col items-center gap-8">
                    
                    {/* Visual Previews */}
                    {previewUrls.length > 0 ? (
                    previewUrls.map((url, index) => (
                        <div key={index} className="relative shadow-lg w-full bg-white rounded-lg overflow-hidden border border-slate-200/60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={url} 
                            alt={`Page ${index + 1}`} 
                            className="w-full h-auto min-h-[200px] object-contain" 
                            onError={(e) => {e.target.style.display='none'}}
                        />
                        
                        {/* Login Wall Blur */}
                        {index === 3 && !activeDoc.downloadLink && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-md">
                            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center border border-slate-100 max-w-sm">
                                <p className="font-bold text-slate-900 text-lg mb-2">Read Full Document</p>
                                <p className="text-slate-500 text-sm mb-6">Create a free account to continue reading.</p>
                                <a href="/login" className="inline-block w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                                Login to Access
                                </a>
                            </div>
                            </div>
                        )}
                        </div>
                    ))
                    ) : (
                    <div className="py-20 text-center w-full">
                        <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <p className="text-slate-400 text-lg font-medium">Preview images unavailable.</p>
                    </div>
                    )}

                    {/* Related Papers Widget */}
                    <div className="w-full pt-8 border-t border-slate-200">
                        <RelatedPapersWidget 
                            currentDoc={activeDoc}
                            allDocs={allDocs}
                            onSelectDoc={onSelectDoc}
                        />
                    </div>
                </div>
            </div>

            {/* RIGHT: ABSTRACT SIDEBAR (CONDITIONAL) */}
            {showAbstract && (
                <div className="w-[400px] bg-white border-l border-slate-200 p-8 overflow-y-auto shrink-0 shadow-xl animate-fade-in relative z-20">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                        Abstract
                    </h3>
                    <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-line text-justify">
                        {activeDoc.ai_abstract || "No abstract available for this document."}
                    </p>
                    
                    <div className="mt-10 space-y-6">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">Document Details</h4>
                        <div className="space-y-4">
                            {activeDoc.ai_journal && (
                                <div>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Source / Journal</span>
                                    <span className="text-sm font-medium text-slate-800 bg-slate-50 px-3 py-2 rounded-lg block border border-slate-100">{activeDoc.ai_journal}</span>
                                </div>
                            )}
                            {activeDoc.ai_date_created && (
                                <div>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Publication Date</span>
                                    <span className="text-sm font-medium text-slate-800 bg-slate-50 px-3 py-2 rounded-lg block border border-slate-100">{activeDoc.ai_date_created}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* === FOOTER === */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-between items-center shrink-0 z-10">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                {previewUrls.length > 0 ? `Displaying ${previewUrls.length} Pages` : 'Document Viewer'}
            </p>
            
            {activeDoc.downloadLink ? (
               <a 
                 href={activeDoc.downloadLink} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-md hover:shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                 Download PDF
               </a>
            ) : (
               <a href="/login" className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-md hover:shadow-lg transition-all">
                 Login to Download
               </a>
            )}
        </div>
      </div>
    </div>
  );
}