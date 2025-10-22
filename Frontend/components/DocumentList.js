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
                    placeholder="Search by title or author..."
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
                        {documents.map((doc) => (
                            <li key={doc.id} className="p-4 border rounded-md hover:bg-gray-50">
                                <h3 className="text-lg font-semibold text-indigo-700">{doc.title}</h3>
                                <p className="text-md text-gray-600">by {doc.author}</p>
                                <a
                                    href={`http://localhost:3001/uploads/${doc.filename}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-500 hover:underline mt-2 inline-block"
                                >
                                    View PDF
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center">No documents found for your search.</p>
                )}
            </div>
        </div>
    );
}