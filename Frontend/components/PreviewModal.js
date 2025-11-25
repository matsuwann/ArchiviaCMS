// ... inside PreviewModal component ...

const previewUrls = document.preview_urls || [];

return (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800 truncate">{document.title}</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-red-500">✕ Close</button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-200 p-4 flex flex-col items-center gap-4 relative">
        
        {previewUrls.length > 0 ? (
          previewUrls.map((url, index) => (
            <div key={index} className="relative shadow-lg group w-full max-w-[700px]">
              <img 
                src={url} 
                alt={`Page ${index + 1}`} 
                className="w-full h-auto bg-white rounded-sm" 
              />
              
              {/* MODIFIED: Only show overlay on Page 6 (Index 5) or later */}
              {index > 4 && !document.downloadLink && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
                  <div className="bg-white/95 p-6 rounded-lg shadow-xl text-center border border-gray-200">
                    <p className="font-bold text-gray-800 text-lg">End of Preview</p>
                    <p className="text-sm text-gray-600 mb-4">Login to download the full paper.</p>
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

      {/* Footer (Same as before) */}
      <div className="p-4 border-t bg-white flex justify-between items-center">
          <p className="text-xs text-gray-500">Preview Mode</p>
          {document.downloadLink ? (
             <a href={document.downloadLink} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 shadow-md flex items-center gap-2">
               <span>⬇</span> Download Full PDF
             </a>
          ) : (
             <a href="/login" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-md hover:bg-slate-800 shadow-md">
               Login to Download
             </a>
          )}
      </div>
    </div>
  </div>
);