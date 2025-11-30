'use client';
import { useState, useEffect } from 'react';
import PreviewModal from './PreviewModal';
import { getCitation } from '../services/apiService';

const getSafeList = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            const cleaned = data.replace(/[\[\]"'{}]/g, '');
            return cleaned.split(',').map(s => s.trim()).filter(s => s);
        }
    }
    return [];
};

export default function DocumentList({ 
    documents = [], 
    isLoading = false, 
    searchPerformed = false, 
    onSearch = () => {}, 
    popularSearches = [],
    initialSearchTerm = '' 
}) {
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    // === CITATION STATE ===
    const [activeCiteMenu, setActiveCiteMenu] = useState(null); // Stores ID of doc with open menu
    const [copyFeedback, setCopyFeedback] = useState(null); // Stores "Copied!" message state

    const itemsPerPage = 5;

    useEffect(() => {
        if (typeof initialSearchTerm === 'string') {
            setSearchTerm(initialSearchTerm);
        }
    }, [initialSearchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [documents]);

    // Close citation menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveCiteMenu(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm);
    };

    // === CITATION HANDLER ===
    const handleCite = async (e, doc, style) => {
        e.stopPropagation(); // Stop menu from closing immediately
        
        // Prepare clean metadata for AI
        const meta = {
            title: doc.title,
            authors: getSafeList(doc.ai_authors).join(', '),
            date: doc.ai_date_created,
            journal: doc.ai_journal || "N/A"
        };

        try {
            // Optimistic UI: "Copying..."
            setCopyFeedback({ id: doc.id, text: 'Generating...' });
            
            const res = await getCitation(meta, style);
            const citation = res.data.citation;

            // Copy to clipboard
            await navigator.clipboard.writeText(citation);
            
            setCopyFeedback({ id: doc.id, text: 'Copied!' });
            setTimeout(() => {
                setCopyFeedback(null);
                setActiveCiteMenu(null);
            }, 2000);

        } catch (err) {
            console.error(err);
            setCopyFeedback({ id: doc.id, text: 'Error' });
        }
    };

    // Toggle Menu
    const toggleCiteMenu = (e, docId) => {
        e.stopPropagation();
        setActiveCiteMenu(activeCiteMenu === docId ? null : docId);
    };

    const safePopularSearches = Array.isArray(popularSearches) ? popularSearches : [];
    const safeDocuments = Array.isArray(documents) ? documents : [];
    const isDataError = documents && !Array.isArray(documents);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDocuments = safeDocuments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(safeDocuments.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <>
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="mb-6">
                    {/* SEARCH BAR */}
                    <form onSubmit={handleFormSubmit} className="flex gap-2 mb-3">
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-grow px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button type="submit" className="py-2 px-6 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition">
                            Search
                        </button>
                    </form>
                    
                    {/* TRENDING */}
                    {safePopularSearches.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-500 font-semibold uppercase">Trending:</span>
                            {safePopularSearches.map((item, idx) => (
                                <button 
                                    key={item.term || idx} 
                                    onClick={() => onSearch(item.term)} 
                                    className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md border border-indigo-100 hover:bg-indigo-100 transition"
                                >
                                    {item.term}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* LIST VIEW */}
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
                        <>
                            <ul className="divide-y divide-gray-100">
                                {currentDocuments.map((doc) => {
                                    try {
                                        const aiAuthors = getSafeList(doc.ai_authors);
                                        const aiKeywords = getSafeList(doc.ai_keywords).slice(0, 5);
                                        const isMenuOpen = activeCiteMenu === doc.id;

                                        return (
                                            <li key={doc.id} className="py-6 hover:bg-gray-50 transition duration-150 -mx-4 px-4 rounded-md">
                                                <div className="flex justify-between items-start">
                                                    <div className="w-full pr-4 cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                                                        <div className="flex justify-between items-start">
                                                            <h3 className="text-lg font-bold text-indigo-700 leading-snug mb-1 hover:underline">
                                                                {doc.title || "Untitled Document"}
                                                            </h3>
                                                            
                                                            {/* === CITE BUTTON === */}
                                                            <div className="relative shrink-0 ml-2">
                                                                <button
                                                                    onClick={(e) => toggleCiteMenu(e, doc.id)}
                                                                    className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 hover:text-indigo-600 transition shadow-sm"
                                                                >
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                                                    Cite
                                                                </button>

                                                                {/* DROPDOWN MENU */}
                                                                {isMenuOpen && (
                                                                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in">
                                                                        {copyFeedback && copyFeedback.id === doc.id ? (
                                                                            <div className="px-3 py-2 text-xs font-bold text-green-600 bg-green-50 text-center">
                                                                                {copyFeedback.text}
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                <button onClick={(e) => handleCite(e, doc, 'APA')} className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">Copy APA</button>
                                                                                <button onClick={(e) => handleCite(e, doc, 'MLA')} className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">Copy MLA</button>
                                                                                <button onClick={(e) => handleCite(e, doc, 'BibTeX')} className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">Copy BibTeX</button>
                                                                                <button onClick={(e) => handleCite(e, doc, 'Harvard')} className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">Copy Harvard</button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="text-sm text-gray-600 mb-2">
                                                            {doc.ai_journal && <span className="font-semibold text-gray-800">{doc.ai_journal}</span>}
                                                            {doc.ai_journal && <span> • </span>}
                                                            <span>{doc.ai_date_created || 'Unknown Date'}</span>
                                                        </div>

                                                        <p className="text-sm text-gray-700 italic mb-2 line-clamp-1">
                                                            {aiAuthors.length > 0 ? aiAuthors.join(', ') : 'Unknown Authors'}
                                                        </p>

                                                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                                            {doc.ai_abstract || "No abstract available."}
                                                        </p>

                                                        {aiKeywords.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {aiKeywords.map((k, i) => (
                                                                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full border border-slate-200">
                                                                        #{k}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    } catch (err) {
                                        return null;
                                    }
                                })}
                            </ul>

                            {/* PAGINATION */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                                    <button 
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-600 font-medium">Page {currentPage} of {totalPages}</span>
                                    <button 
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {selectedDoc && (
                <PreviewModal 
                    document={selectedDoc} 
                    allDocs={safeDocuments}
                    onSelectDoc={setSelectedDoc}
                    onClose={() => setSelectedDoc(null)} 
                />
            )}
        </>
    );
}