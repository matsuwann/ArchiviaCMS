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
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Repository Search</h2>
            
            <form onSubmit={handleFormSubmit} className="flex gap-2 mb-2">
                <input
                    type="text"
                    placeholder="Search by title, author, date, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button type="submit" className="py-2 px-4 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700">
                    Search
                </button>
            </form>

            {/* Popular Searches Section */}
            {popularSearches && popularSearches.length > 0 && (
                <div className="mb-6">
                    <p className="text-xs text-gray-500 mb-2 uppercase font-semibold tracking-wide">Trending Topics:</p>
                    <div className="flex flex-wrap gap-2">
                        {popularSearches.map((item) => (
                            <button
                                key={item.term}
                                onClick={() => handleChipClick(item.term)}
                                className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors"
                            >
                                {item.term}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div>
                {isLoading ? (
                    <p className="text-center text-gray-500 py-8">Searching repository...</p>
                ) : !searchPerformed && documents.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500">Enter a search term or select a filter to begin.</p>
                    </div>
                ) : documents.length > 0 ? (
                    <ul className="space-y-4">
                        {documents.map((doc) => {
                            const aiAuthors = doc.ai_authors || [];
                            const aiKeywords = doc.ai_keywords || [];
                            
                            return (
                                <li key={doc.id} className="p-4 border rounded-md hover:bg-gray-50 transition duration-150">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold text-indigo-700">{doc.title}</h3>
                                            {doc.ai_journal && (
                                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                                                    {doc.ai_journal}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {aiAuthors.length > 0 && (
                                        <p className="text-sm text-gray-700 mt-1">
                                            <span className="font-semibold">Author(s):</span> {aiAuthors.join(', ')}
                                        </p>
                                    )}

                                    {doc.ai_date_created && (
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold">Date:</span> {doc.ai_date_created}
                                        </p>
                                    )}

                                    {aiKeywords.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {aiKeywords.map((tag, index) => (
                                                <span key={index} className="px-2 py-1 text-xs font-medium text-white bg-gray-400 rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4">
                                        <a
                                            href={doc.filepath}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            View PDF
                                        </a>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-600">No documents found matching your criteria.</p>
                        <button 
                            onClick={() => onSearch('')} 
                            className="mt-2 text-sm text-indigo-600 hover:underline"
                        >
                            View all documents
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}