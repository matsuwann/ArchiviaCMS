'use client';
import { useState } from 'react';

export default function DocumentList({ documents, isLoading, searchPerformed, onSearch, popularSearches }) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm);
    };

    const handleChipClick = (term) => {
        setSearchTerm(term);
        onSearch(term);
    };
    
    return (
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header & Search Bar */}
            <div className="mb-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">My Library</h2>
                <form onSubmit={handleFormSubmit} className="flex gap-2 mb-3">
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button type="submit" className="py-2 px-6 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 transition-colors">
                        Search
                    </button>
                </form>

                {/* Analytics Chips */}
                {popularSearches && popularSearches.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-500 font-semibold uppercase">Trending:</span>
                        {popularSearches.map((item) => (
                            <button
                                key={item.term}
                                onClick={() => handleChipClick(item.term)}
                                className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md border border-indigo-100 hover:bg-indigo-100 transition-colors"
                            >
                                {item.term}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* List Content */}
            <div>
                {isLoading ? (
                    <p className="text-center text-gray-500 py-10 italic">Loading library...</p>
                ) : !searchPerformed && documents.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-600">Library is empty or no filters selected.</p>
                        <button 
                            onClick={() => onSearch('')} 
                            className="mt-2 text-sm text-indigo-600 hover:underline"
                        >
                            Show all documents
                        </button>
                    </div>
                ) : documents.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                        {documents.map((doc) => {
                            const aiAuthors = doc.ai_authors || [];
                            
                            return (
                                <li key={doc.id} className="py-4 hover:bg-gray-50 transition duration-150 -mx-4 px-4 rounded-md">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-base font-semibold text-indigo-700 leading-snug mb-1">
                                                {doc.title || "Untitled Document"}
                                            </h3>
                                            {doc.ai_journal && (
                                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                                                    {doc.ai_journal}
                                                </p>
                                            )}
                                            
                                            <div className="text-sm text-gray-700">
                                                {aiAuthors.length > 0 && (
                                                    <span>{aiAuthors.join(', ')}</span>
                                                )}
                                                {aiAuthors.length > 0 && doc.ai_date_created && <span> • </span>}
                                                {doc.ai_date_created && (
                                                    <span>{doc.ai_date_created}</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <a
                                            href={doc.filepath}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-4 text-sm font-medium text-gray-500 hover:text-indigo-600 flex-shrink-0 flex items-center gap-1 border px-2 py-1 rounded hover:border-indigo-300 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                            PDF
                                        </a>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-600">No documents found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}