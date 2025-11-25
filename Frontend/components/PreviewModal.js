// Frontend/components/PreviewModal.js
'use client';

export default function PreviewModal({ document, onClose }) {
  if (!document) return null;

  const previewUrls = document.preview_urls || [];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 truncate">{document.title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-red-500">
            ✕ Close
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-200 p-4 flex flex-col items-center gap-4 relative">
          
          {/* Render Preview Images */}
          {previewUrls.length > 0 ? (
            previewUrls.map((url, index) => (
              <div key={index} className="relative shadow-lg group">
                <img 
                  src={url} 
                  alt={`Page ${index + 1}`} 
                  className="max-w-full w-[700px] bg-white rounded-sm" 
                />
                
                {/* If it's the 2nd or 3rd page (blurred), add overlay */}
                {index > 0 && !document.downloadLink && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[2px]">
                    <div className="bg-white/90 p-6 rounded-lg shadow-xl text-center border border-gray-200">
                      <p className="font-bold text-gray-800 text-lg">Premium Content</p>
                      <p className="text-sm text-gray-600 mb-4">Login to view the full document.</p>
                      <a href="/login" className="px-6 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700">
                        Login Now
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white p-10 rounded-lg shadow text-center">
              <p>No preview available.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex justify-between items-center">
          <p className="text-xs text-gray-500">Preview Mode</p>
          
          {document.downloadLink ? (
             <a
               href={document.downloadLink}
               target="_blank"
               rel="noopener noreferrer"
               className="px-6 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 shadow-md flex items-center gap-2"
             >
               <span>⬇</span> Download Full PDF
             </a>
          ) : (
             <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Want the full file?</span>
                <a href="/login" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-md hover:bg-slate-800 shadow-md">
                  Login to Access
                </a>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}