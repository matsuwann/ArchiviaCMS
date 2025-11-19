'use client';
import { useState } from 'react';

export default function DocumentList({ documents, isLoading, searchPerformed, onSearch }) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm);
    };
    
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Repository Search</h2>
            <form onSubmit={handleFormSubmit} className="flex gap-2 mb-6">
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

            <div>
                {isLoading ? (
                    <p className="text-center">Searching...</p>
                ) : !searchPerformed ? (
                    <p className="text-center text-gray-500">Please enter a search term to begin.</p>
                ) : documents.length > 0 ? (
                    <ul className="space-y-4">
                        {documents.map((doc) => {
                            const aiAuthors = doc.ai_authors || [];
                            const aiKeywords = doc.ai_keywords || [];
                            
                            return (
                                <li key={doc.id} className="p-4 border rounded-md hover:bg-gray-50">
                                    <h3 className="text-lg font-semibold text-indigo-700">{doc.title}</h3>
                                    
                                    {aiAuthors.length > 0 && (
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold">Author(s):</span> {aiAuthors.join(', ')}
                                        </p>
                                    )}

                                    {doc.ai_date_created && (
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold">Date Created:</span> {doc.ai_date_created}
                                        </p>
                                    )}

                                    {aiKeywords.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {aiKeywords.map((tag, index) => (
                                                <span key={index} className="px-2 py-1 text-xs font-medium text-white bg-indigo-500 rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* MODIFIED: Action Buttons Container */}
                                    <div className="mt-3 flex gap-4">
                                        <a
                                            href={doc.filepath}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            View PDF
                                        </a>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-center">No documents found for your search.</p>
                )}
            </div>
        </div>
    );
}