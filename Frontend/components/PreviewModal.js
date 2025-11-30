'use client';
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
  if (!activeDoc) return null;

  const previewUrls = getSafeList(activeDoc.preview_urls);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-white shrink-0">
          <h2 className="text-lg font-bold text-slate-800 truncate pr-4">{activeDoc.title || "Untitled Document"}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-red-500 text-sm font-semibold px-4 py-2 rounded-md hover:bg-slate-50 transition-colors">
            Close ✕
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 relative" id="modal-content">
          
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
            
            {/* Visual Previews */}
            {previewUrls.length > 0 ? (
              previewUrls.map((url, index) => (
                <div key={index} className="relative shadow-md w-full">
                  <img 
                    src={url} 
                    alt={`Page ${index + 1}`} 
                    className="w-full h-auto bg-white rounded-sm min-h-[200px] object-contain" 
                    onError={(e) => {e.target.style.display='none'}}
                  />
                  
                  {/* BLUR OVERLAY (Login Wall) */}
                  {index === 3 && !activeDoc.downloadLink && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                      <div className="bg-white p-8 rounded-xl shadow-xl text-center border border-gray-200 max-w-sm">
                        <p className="font-bold text-gray-900 text-xl mb-2">Continue Reading</p>
                        <a href="/login" className="inline-block w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md">
                          Login to Access Full File
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white p-16 rounded-lg shadow-sm text-center w-full border border-gray-200">
                <p className="text-gray-400 text-lg font-medium mb-2">Preview Unavailable</p>
                <p className="text-sm text-gray-400">Download the file to view its contents.</p>
              </div>
            )}

            {/* RELATED PAPERS WIDGET */}
            {/* This sits at the bottom of the scrollable area */}
            <div className="w-full pt-8">
                <RelatedPapersWidget 
                    currentDoc={activeDoc}
                    allDocs={allDocs}
                    onSelectDoc={(doc) => {
                    const scrollContainer = document.getElementById('modal-content');
                    if(scrollContainer) scrollContainer.scrollTop = 0;
                    onSelectDoc(doc);
                    }}
                />
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex justify-between items-center shrink-0">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {previewUrls.length} Page Preview
            </p>
            
            {activeDoc.downloadLink ? (
               <a 
                 href={activeDoc.downloadLink} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="px-6 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 shadow-md flex items-center gap-2 transition-colors"
               >
                 Download PDF
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