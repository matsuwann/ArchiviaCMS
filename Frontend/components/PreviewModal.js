'use client';

export default function PreviewModal({ document, onClose }) {
  // 1. Safety check: If no document is passed, don't render anything
  if (!document) return null;

  // 2. Get the preview URLs (default to empty array if missing)
  const previewUrls = document.preview_urls || [];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 truncate">{document.title || "Untitled Document"}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-red-500 text-sm font-semibold px-2">
            ✕ Close
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-200 p-4 flex flex-col items-center gap-4 relative">
          
          {/* Logic: If we have preview images, show them. Otherwise show a fallback message. */}
          {previewUrls.length > 0 ? (
            previewUrls.map((url, index) => (
              <div key={index} className="relative shadow-lg group w-full max-w-[700px]">
                <img 
                  src={url} 
                  alt={`Page ${index + 1}`} 
                  className="w-full h-auto bg-white rounded-sm" 
                />
                
                {/* BLUR OVERLAY LOGIC:
                    Show this overlay ONLY if:
                    1. It is Page 6 or later (index > 4)
                    2. AND the user does NOT have a download link (not logged in)
                */}
                {index > 4 && !document.downloadLink && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[4px]">
                    <div className="bg-white/95 p-8 rounded-xl shadow-2xl text-center border border-gray-200 max-w-sm">
                      <p className="font-bold text-gray-900 text-xl mb-2">End of Free Preview</p>
                      <p className="text-sm text-gray-600 mb-6">
                        This document has more pages. Log in to your account to download the full PDF.
                      </p>
                      <a href="/login" className="inline-block w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md">
                        Login to Access Full File
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            // Fallback if no preview images exist (e.g. old uploads)
            <div className="bg-white p-10 rounded-lg shadow text-center max-w-md mt-10">
              <p className="text-gray-800 font-medium mb-2">Preview not available</p>
              <p className="text-sm text-gray-500">
                This document does not have a visual preview. You can download the file directly below if you are logged in.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex justify-between items-center shrink-0">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Preview Mode
            </p>
            
            {document.downloadLink ? (
               // Logged In: Show Download Button
               <a 
                 href={document.downloadLink} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="px-6 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 shadow-md flex items-center gap-2 transition-colors"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                 Download Full PDF
               </a>
            ) : (
               // Guest: Show Login Button
               <a href="/login" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-md hover:bg-slate-800 shadow-md transition-colors">
                 Login to Download
               </a>
            )}
        </div>
      </div>
    </div>
  );
}