'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function DocumentList({ documents, isLoading, searchPerformed, onSearch, popularSearches }) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm);
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="mb-6">
                
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
                
                {popularSearches && popularSearches.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-500 font-semibold uppercase">Trending:</span>
                        {popularSearches.map((item) => (
                            <button key={item.term} onClick={() => onSearch(item.term)} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md border border-indigo-100 hover:bg-indigo-100">
                                {item.term}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div>
                {isLoading ? (
                    <p className="text-center text-gray-500 py-10 italic">Loading library...</p>
                ) : !searchPerformed && documents.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-600">Library is empty.</p>
                    </div>
                ) : documents.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                        {documents.map((doc) => {
                            const aiAuthors = doc.ai_authors || [];
                            
                            return (
                                <li key={doc.id} className="py-6 hover:bg-gray-50 transition duration-150 -mx-4 px-4 rounded-md">
                                    <div className="flex justify-between items-start">
                                        <div className="w-full pr-4">
                                            <h3 className="text-lg font-bold text-indigo-700 leading-snug mb-1">
                                                {doc.title || "Untitled Document"}
                                            </h3>
                                            <div className="text-sm text-gray-600 mb-2">
                                                {doc.ai_journal && <span className="font-semibold text-gray-800">{doc.ai_journal}</span>}
                                                {doc.ai_journal && <span> • </span>}
                                                <span>{doc.ai_date_created || 'Unknown Date'}</span>
                                            </div>
                                            <p className="text-sm text-gray-700 italic mb-2">
                                                {aiAuthors.join(', ')}
                                            </p>
                                            
                                            {/* ABSTRACT PREVIEW */}
                                            {doc.ai_abstract && (
                                                <div className="bg-slate-50 p-3 rounded-md border border-slate-100 text-sm text-gray-600 mb-3">
                                                    <span className="font-bold text-xs text-slate-400 uppercase tracking-wide block mb-1">Abstract</span>
                                                    {doc.ai_abstract}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* VIEW PDF BUTTON (CONDITIONAL) */}
                                        <div className="flex-shrink-0">
                                            {doc.filepath ? (
                                                <a
                                                    href={doc.filepath}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 shadow-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                    View PDF
                                                </a>
                                            ) : (
                                                <Link href="/login">
                                                    <button className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-md hover:bg-gray-200 border border-gray-200">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                        Login to Read
                                                    </button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-center py-10 text-gray-600">No documents found.</p>
                )}
            </div>
        </div>
    );
}