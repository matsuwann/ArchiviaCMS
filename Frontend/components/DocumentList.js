'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function DocumentList({ documents, setDocuments }) {
    const [searchTerm, setSearchTerm] = useState('');

    const fetchDocuments = async () => {
        const endpoint = searchTerm 
            ? `http://localhost:3001/api/documents/search?term=${searchTerm}` 
            : 'http://localhost:3001/api/documents';
        try {
            const response = await axios.get(endpoint);
            setDocuments(response.data);
        } catch (error) {
            console.error("Failed to fetch documents:", error);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchDocuments();
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Repository Documents</h2>
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <input
                    type="text"
                    placeholder="Search by title or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button type="submit" className="py-2 px-4 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700">Search</button>
            </form>
            <ul className="space-y-4">
                {documents.length > 0 ? (
                    documents.map((doc) => (
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
                    ))
                ) : (
                    <p>No documents found.</p>
                )}
            </ul>
        </div>
    );
}