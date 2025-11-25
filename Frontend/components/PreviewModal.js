'use client';

export default function PreviewModal({ document, onClose }) {
  if (!document) return null;

  // Helper to safely ensure we have an array
  const getArray = (data) => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        // Try to parse JSON string (e.g., '["Tag1", "Tag2"]')
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // If parse fails, return the string as a single item or empty array
        return data ? [data] : [];
      }
    }
    return [];
  };

  // Parse the fields safely
  const authors = getArray(document.ai_authors);
  const keywords = getArray(document.ai_keywords);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-slate-50 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">
              {document.title || "Untitled Document"}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
              {document.ai_journal && (
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  {document.ai_journal}
                </span>
              )}
              <span>{document.ai_date_created || 'Unknown Date'}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto">
          
          {/* Authors */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Authors</h3>
            <p className="text-slate-700 font-medium">
              {authors.length > 0 ? authors.join(', ') : 'Unknown Authors'}
            </p>
          </div>

          {/* Abstract */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Abstract / Summary</h3>
            <div className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
              {document.ai_abstract 
                ? document.ai_abstract 
                : <span className="text-gray-400 italic">No abstract available for this document.</span>
              }
            </div>
          </div>

          {/* Keywords */}
          {keywords.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {keywords.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
          
          {document.filepath ? (
             <a
               href={document.filepath}
               target="_blank"
               rel="noopener noreferrer"
               className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
               View Full PDF
             </a>
          ) : (
             <a href="/login" className="px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 shadow-sm flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
               Login to Download
             </a>
          )}
        </div>
      </div>
    </div>
  );
}