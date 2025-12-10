'use client';
import { useState, useEffect } from 'react'; // 1. Added useEffect import
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

  // 2. FIX: Lock background scrolling when modal is open
  useEffect(() => {
    // Disable scroll on body
    document.body.style.overflow = 'hidden';
    
    // Re-enable scroll when modal closes
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // 3. FIX: Instantly scroll to top of the preview when the document changes
  useEffect(() => {
    const scrollContainer = document.getElementById('modal-content');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, [activeDoc]); // Triggers every time activeDoc updates

  if (!activeDoc) return null;

  const previewUrls = getSafeList(activeDoc.preview_urls);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        
        {/* === HEADER === */}
        <div className="p-4 border-b flex justify-between items-center bg-white shrink-0 z-10">
          <div className="flex items-center gap-4 overflow-hidden">
             <h2 className="text-lg font-bold text-slate-800 truncate">{activeDoc.title || "Untitled Document"}</h2>
             
             {/* TOGGLE BUTTON */}
             <button 
               onClick={() => setShowAbstract(!showAbstract)}
               className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-2
                 ${showAbstract 
                   ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                   : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'}`}
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
               {showAbstract ? 'Hide Abstract' : 'Show Abstract'}
             </button>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* === MAIN CONTENT AREA (SPLIT VIEW) === */}
        <div className="flex flex-1 overflow-hidden relative">
            
            {/* LEFT: SCROLLABLE PDF PREVIEW */}
            {/* Added scroll-smooth for nicer transitions if manually scrolling */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 scroll-smooth" id="modal-content">
                <div className="max-w-3xl mx-auto flex flex-col items-center gap-8">
                    
                    {/* Visual Previews */}
                    {previewUrls.length > 0 ? (
                    previewUrls.map((url, index) => (
                        <div key={index} className="relative shadow-md w-full bg-white rounded-sm border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={url} 
                            alt={`Page ${index + 1}`} 
                            className="w-full h-auto min-h-[200px] object-contain" 
                            onError={(e) => {e.target.style.display='none'}}
                        />
                        
                        {/* Login Wall Blur */}
                        {index === 3 && !activeDoc.downloadLink && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                            <div className="bg-white p-6 rounded-xl shadow-xl text-center border border-gray-200 max-w-sm">
                                <p className="font-bold text-gray-900 text-lg mb-2">Continue Reading</p>
                                <a href="/login" className="inline-block w-full px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md">
                                Login to Access
                                </a>
                            </div>
                            </div>
                        )}
                        </div>
                    ))
                    ) : (
                    <div className="py-20 text-center w-full">
                        <p className="text-gray-400 text-lg font-medium">Preview images unavailable.</p>
                    </div>
                    )}

                    {/* Related Papers Widget */}
                    <div className="w-full pt-4">
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
                <div className="w-[350px] bg-white border-l border-slate-200 p-6 overflow-y-auto shrink-0 shadow-xl animate-fade-in">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Abstract
                    </h3>
                    <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-line">
                        {activeDoc.ai_abstract || "No abstract available for this document."}
                    </p>
                    
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Metadata</h4>
                        <div className="space-y-2">
                            {activeDoc.ai_journal && (
                                <div>
                                    <span className="text-xs text-slate-500 block">Source</span>
                                    <span className="text-sm font-medium text-slate-800">{activeDoc.ai_journal}</span>
                                </div>
                            )}
                            {activeDoc.ai_date_created && (
                                <div>
                                    <span className="text-xs text-slate-500 block">Date</span>
                                    <span className="text-sm font-medium text-slate-800">{activeDoc.ai_date_created}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* === FOOTER === */}
        <div className="p-4 border-t bg-white flex justify-between items-center shrink-0 z-10">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {previewUrls.length > 0 ? `${previewUrls.length} Page Preview` : 'Document Viewer'}
            </p>
            
            {activeDoc.downloadLink ? (
               <a 
                 href={activeDoc.downloadLink} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="px-6 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 shadow-md flex items-center gap-2 transition-colors"
               >
                 Download Full PDF
               </a>
            ) : (
               <a href="/login" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-md hover:bg-slate-800 shadow-md transition-colors">
                 Login to Download
               </a>
            )}
        </div>
      </div>
    </div>
  );
}