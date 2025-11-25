'use client';
import { useState } from 'react';
import PreviewModal from './PreviewModal';

// Helper to safely parse authors
const getSafeList = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
        const cleaned = data.replace(/[\[\]"']/g, '');
        return cleaned.split(',').map(s => s.trim()).filter(s => s);
    }
    return [];
};

export default function DocumentList({ 
    documents = [], 
    isLoading = false, 
    searchPerformed = false, 
    onSearch = () => {}, 
    popularSearches = [] 
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoc, setSelectedDoc] = useState(null);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm);
    };

    // Force popularSearches to be an array
    const safePopularSearches = Array.isArray(popularSearches) ? popularSearches : [];
    
    // Force documents to be an array. If it's not, use empty array [] to prevent crash.
    const safeDocuments = Array.isArray(documents) ? documents : [];
    const isDataError = documents && !Array.isArray(documents);

    return (
        <>
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="mb-6">
                    {/* SEARCH BAR - ALWAYS VISIBLE */}
                    <form onSubmit={handleFormSubmit} className="flex gap-2 mb-3">
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-grow px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button type="submit" className="py-2 px-6 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700">
                            Search
                        </button>
                    </form>
                    
                    {/* TRENDING - SAFE RENDER */}
                    {safePopularSearches.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-500 font-semibold uppercase">Trending:</span>
                            {safePopularSearches.map((item, idx) => (
                                <button 
                                    key={item.term || idx} 
                                    onClick={() => onSearch(item.term)} 
                                    className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md border border-indigo-100 hover:bg-indigo-100"
                                >
                                    {item.term}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* DOCUMENT LIST */}
                <div>
                    {isLoading ? (
                        <p className="text-center text-gray-500 py-10 italic">Loading library...</p>
                    ) : isDataError ? (
                        <div className="text-center py-10 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-red-600 font-semibold">Unable to load documents.</p>
                            <p className="text-sm text-red-500 mt-1">System received invalid data format.</p>
                        </div>
                    ) : !searchPerformed && safeDocuments.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-gray-400 text-lg">Enter a keyword above to search the Archivia repository.</p>
                        </div>
                    ) : safeDocuments.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-600">No results found for your search.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {safeDocuments.map((doc) => {
                                try {
                                    const aiAuthors = getSafeList(doc.ai_authors);
                                    
                                    return (
                                        <li key={doc.id} className="py-6 hover:bg-gray-50 transition duration-150 -mx-4 px-4 rounded-md">
                                            <div className="flex justify-between items-start">
                                                <div className="w-full pr-4 cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                                                    <h3 className="text-lg font-bold text-indigo-700 leading-snug mb-1 hover:underline">
                                                        {doc.title || "Untitled Document"}
                                                    </h3>
                                                    <div className="text-sm text-gray-600 mb-2">
                                                        {doc.ai_journal && <span className="font-semibold text-gray-800">{doc.ai_journal}</span>}
                                                        {doc.ai_journal && <span> • </span>}
                                                        <span>{doc.ai_date_created || 'Unknown Date'}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 italic mb-2 line-clamp-1">
                                                        {aiAuthors.join(', ')}
                                                    </p>
                                                    <p className="text-sm text-gray-500 line-clamp-2">
                                                        {doc.ai_abstract || "Click to preview abstract..."}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                } catch (err) {
                                    return null; // Skip individual bad rows
                                }
                            })}
                        </ul>
                    )}
                </div>
            </div>

            {selectedDoc && (
                <PreviewModal 
                    document={selectedDoc} 
                    onClose={() => setSelectedDoc(null)} 
                />
            )}
        </>
    );
}