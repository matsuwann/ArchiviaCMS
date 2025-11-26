'use client';

import { useState, useEffect } from 'react';
import DocumentList from '../components/DocumentList';
import FilterSidebar from '../components/FilterSidebar';
import { searchDocuments, getFilters, filterDocuments, getPopularSearches } from '../services/apiService';

export default function Home() {
  // App State
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  
  // Data State
  const [availableFilters, setAvailableFilters] = useState({ authors: [], keywords: [], years: [], journals: [] });
  const [popularSearches, setPopularSearches] = useState([]);
  
  // Selection State
  const [selectedFilters, setSelectedFilters] = useState({ authors: [], keywords: [], year: null, journal: [], dateRange: null });

  useEffect(() => {
    // Load initial data
    Promise.all([
      searchDocuments(''),      
      getFilters(),             
      getPopularSearches()      
    ]).then(([docsRes, filtersRes, popRes]) => {
      setDocuments(docsRes.data);
      setAvailableFilters(filtersRes.data);
      setPopularSearches(popRes.data);
      setIsLoading(false);
    }).catch(err => {
      console.error("Init failed:", err);
      setIsLoading(false);
    });
  }, []);

  const handleSearch = async (searchTerm) => {
    setIsLoading(true);
    setSearchPerformed(true); // Switch to list view
    setCurrentSearchTerm(searchTerm); // Pass term to list view input
    
    // Reset filters on new search text
    setSelectedFilters({ authors: [], keywords: [], year: null, journal: [], dateRange: null });

    try {
      const response = await searchDocuments(searchTerm);
      setDocuments(response.data);
      
      if(searchTerm) {
          setTimeout(() => {
             getPopularSearches().then(res => setPopularSearches(res.data));
          }, 1000);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = async (category, value) => {
    if (category === 'reset') {
        setSelectedFilters({ authors: [], keywords: [], year: null, journal: [], dateRange: null });
        const res = await searchDocuments('');
        setDocuments(res.data);
        return;
    }

    const newFilters = { ...selectedFilters, [category]: value };
    setSelectedFilters(newFilters);
    setIsLoading(true);

    try {
      const isEmpty = newFilters.authors.length === 0 && 
                      newFilters.keywords.length === 0 && 
                      newFilters.journal.length === 0 && 
                      !newFilters.year && 
                      !newFilters.dateRange;

      if (isEmpty) {
         const res = await searchDocuments('');
         setDocuments(res.data);
      } else {
         const response = await filterDocuments(newFilters);
         setDocuments(response.data);
      }
    } catch (error) {
      console.error("Filter failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER ---

  // 1. Landing Page View (Hero)
  if (!searchPerformed && !isLoading && documents.length >= 0 && currentSearchTerm === '') {
    return (
      <main className="min-h-screen flex flex-col bg-white">
        {/* Hero Section */}
        <div 
            className="flex-grow flex flex-col items-center justify-center px-4 text-center relative"
            style={{
                background: 'linear-gradient(to bottom right, #1e1b4b, #312e81, #4338ca)',
                color: 'white'
            }}
        >
            <div className="max-w-3xl w-full z-10 space-y-8">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                    Discover Research.
                </h1>
                <p className="text-xl text-indigo-100 font-light">
                    Access thousands of academic papers, journals, and articles in one place.
                </p>

                {/* Hero Search Bar */}
                <div className="bg-white p-2 rounded-full shadow-2xl flex items-center max-w-2xl mx-auto">
                    <span className="pl-4 text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </span>
                    <input 
                        type="text" 
                        placeholder="Search for papers, authors, or keywords..." 
                        className="flex-grow px-4 py-3 text-gray-800 bg-transparent focus:outline-none text-lg"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch(e.target.value);
                        }}
                    />
                    <button 
                        className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition transform hover:scale-105"
                        onClick={(e) => handleSearch(e.target.previousSibling.value)}
                    >
                        Search
                    </button>
                </div>

                {/* Quick Stats / Popular */}
                <div className="pt-8">
                    <p className="text-sm text-indigo-200 mb-4 uppercase tracking-widest">Popular Searches</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {popularSearches.slice(0, 5).map((item, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleSearch(item.term)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm border border-white/20 text-sm transition"
                            >
                                {item.term}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                 {/* You can add an <img> here for the system-background.png if you want it blended */}
                 <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[100px]"></div>
                 <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[100px]"></div>
            </div>
        </div>

        {/* Footer / CTA Section */}
        <div className="bg-gray-50 py-12 border-t border-gray-200 text-center">
            <p className="text-gray-600 mb-4">Want to browse the full repository?</p>
            <button 
                onClick={() => { setSearchPerformed(true); handleSearch(''); }}
                className="text-indigo-600 font-bold hover:underline"
            >
                View All Documents &rarr;
            </button>
        </div>
      </main>
    );
  }

  // 2. Results View (Standard Library Interface)
  return (
    <main className="container mx-auto p-4 md:p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Archivia Library</h1>
        <button 
            onClick={() => { setSearchPerformed(false); setCurrentSearchTerm(''); }}
            className="text-sm text-gray-500 hover:text-indigo-600 underline"
        >
            &larr; Back to Home
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* LEFT SIDEBAR */}
        <aside className="w-full md:w-1/4 flex-shrink-0">
            <FilterSidebar 
                filters={availableFilters} 
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
            />
        </aside>

        {/* MAIN CONTENT */}
        <div className="w-full md:w-3/4">
            <DocumentList 
              documents={documents} 
              isLoading={isLoading}
              searchPerformed={searchPerformed || documents.length > 0}
              onSearch={handleSearch}
              popularSearches={popularSearches}
              initialSearchTerm={currentSearchTerm} // Pass term from Hero search
            />
        </div>
      </div>
    </main>
  );
}