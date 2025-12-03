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
    const [activeCiteMenu, setActiveCiteMenu] = useState(null); 
    const [copyFeedback, setCopyFeedback] = useState(null); 

    const itemsPerPage = 5;

    useEffect(() => {
        if (typeof initialSearchTerm === 'string') setSearchTerm(initialSearchTerm);
    }, [initialSearchTerm]);

    useEffect(() => { setCurrentPage(1); }, [documents]);

    useEffect(() => {
        const handleClickOutside = () => setActiveCiteMenu(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm);
    };

    const handleCite = async (e, doc, style) => {
        e.stopPropagation(); 
        const meta = {
            title: doc.title,
            authors: getSafeList(doc.ai_authors).join(', '),
            date: doc.ai_date_created,
            journal: doc.ai_journal || "N/A"
        };

        try {
            setCopyFeedback({ id: doc.id, text: 'Generating...' });
            const res = await getCitation(meta, style);
            await navigator.clipboard.writeText(res.data.citation);
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

    return (
        <>
            <div className="space-y-6">
                {/* SEARCH HEADER */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white/50">
                    <form onSubmit={handleFormSubmit} className="flex gap-2">
                        <div className="relative flex-grow">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Search repository..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 rounded-xl transition-all outline-none"
                            />
                        </div>
                        <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-md active:scale-95">
                            Search
                        </button>
                    </form>
                    
                    {safePopularSearches.length > 0 && (
                        <div className="flex items-center gap-2 mt-3 text-sm overflow-x-auto pb-1 scrollbar-hide">
                            <span className="text-gray-400 font-medium whitespace-nowrap">Trending:</span>
                            {safePopularSearches.map((item, idx) => (
                                <button 
                                    key={item.term || idx} 
                                    onClick={() => onSearch(item.term)} 
                                    className="px-3 py-1 bg-white hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 border border-gray-200 rounded-full transition whitespace-nowrap text-xs font-medium"
                                >
                                    {item.term}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* RESULTS LIST */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-indigo-400 opacity-75">
                            <div className="w-10 h-10 border-4 border-current border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="font-medium animate-pulse">Searching the archives...</p>
                        </div>
                    ) : isDataError ? (
                        <div className="p-6 bg-red-50 rounded-xl border border-red-100 text-center text-red-600">
                            System encountered an error loading documents.
                        </div>
                    ) : !searchPerformed && safeDocuments.length === 0 ? (
                        <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                            <div className="text-6xl mb-4 opacity-20">📚</div>
                            <p className="text-gray-500 font-medium">Enter a search term to explore the library.</p>
                        </div>
                    ) : safeDocuments.length === 0 ? (
                        <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-500">No documents found matching your criteria.</p>
                        </div>
                    ) : (
                        currentDocuments.map((doc) => {
                            const aiAuthors = getSafeList(doc.ai_authors);
                            const aiKeywords = getSafeList(doc.ai_keywords).slice(0, 4);
                            const isMenuOpen = activeCiteMenu === doc.id;

                            return (
                                <div 
                                    key={doc.id} 
                                    onClick={() => setSelectedDoc(doc)}
                                    className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 cursor-pointer relative overflow-hidden"
                                >
                                    {/* Hover Accent */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>

                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                        <div className="flex-1">
                                            {/* Badges */}
                                            <div className="flex flex-wrap gap-2 mb-2 text-xs font-semibold tracking-wide uppercase text-gray-400">
                                                <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md border border-indigo-100">
                                                    {doc.ai_journal || "Research Paper"}
                                                </span>
                                                <span>• {doc.ai_date_created || 'Date N/A'}</span>
                                            </div>

                                            <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors mb-2">
                                                {doc.title || "Untitled Document"}
                                            </h3>

                                            <p className="text-sm text-gray-600 mb-3 font-medium">
                                                {aiAuthors.length > 0 ? aiAuthors.join(', ') : 'Unknown Authors'}
                                            </p>

                                            <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-4">
                                                {doc.ai_abstract || "No abstract available for this document."}
                                            </p>

                                            {/* Keywords */}
                                            <div className="flex flex-wrap gap-2">
                                                {aiKeywords.map((k, i) => (
                                                    <span key={i} className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                        #{k}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 self-start sm:self-center">
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => toggleCiteMenu(e, doc.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                                    Cite
                                                </button>

                                                {/* Citation Dropdown */}
                                                {isMenuOpen && (
                                                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl ring-1 ring-black/5 z-50 overflow-hidden animate-fade-in origin-top-right">
                                                        <div className="py-1">
                                                            {copyFeedback && copyFeedback.id === doc.id ? (
                                                                <div className="px-4 py-3 text-xs font-bold text-green-600 bg-green-50 text-center flex items-center justify-center gap-1">
                                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                                                                    {copyFeedback.text}
                                                                </div>
                                                            ) : (
                                                                ['APA', 'MLA', 'BibTeX', 'Harvard'].map(style => (
                                                                    <button 
                                                                        key={style}
                                                                        onClick={(e) => handleCite(e, doc, style)} 
                                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                                                    >
                                                                        Copy {style}
                                                                    </button>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 pt-6">
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            ←
                        </button>
                        <div className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 shadow-sm">
                            Page {currentPage} / {totalPages}
                        </div>
                        <button 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            →
                        </button>
                    </div>
                )}
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