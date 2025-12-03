'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DocumentList from '../components/DocumentList';
import FilterSidebar from '../components/FilterSidebar';
import { searchDocuments, getFilters, filterDocuments, getPopularSearches } from '../services/apiService';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL-Driven State
  const currentSearchTerm = searchParams.get('q');
  const isHeroMode = currentSearchTerm === null;

  // App Data State
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [heroInput, setHeroInput] = useState(''); 

  // Filter/Data State
  const [availableFilters, setAvailableFilters] = useState({ authors: [], keywords: [], years: [], journals: [] });
  const [popularSearches, setPopularSearches] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({ authors: [], keywords: [], year: null, journal: [], dateRange: null });

  useEffect(() => {
    Promise.all([getFilters(), getPopularSearches()])
      .then(([filtersRes, popRes]) => {
        setAvailableFilters(filtersRes.data || { authors: [], keywords: [], years: [], journals: [] });
        setPopularSearches(Array.isArray(popRes.data) ? popRes.data : []);
      }).catch(err => {
        console.error("Initial load error:", err);
        setPopularSearches([]);
      });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!isHeroMode) {
            const term = currentSearchTerm || '';
            const response = await searchDocuments(term);
            setDocuments(response.data || []);
        } else {
            setDocuments([]); 
        }
      } catch (error) {
        console.error("Search failed:", error);
        setDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentSearchTerm, isHeroMode]);

  const handleSearch = (term) => {
    if (!term) return; 
    const cleanTerm = typeof term === 'string' ? term : String(term);
    router.push(`/?q=${encodeURIComponent(cleanTerm)}`);
  };

  const handleBrowseAll = () => {
    router.push('/?q='); 
  };

  const handleFilterChange = async (category, value) => {
    if (category === 'reset') {
        setSelectedFilters({ authors: [], keywords: [], year: null, journal: [], dateRange: null });
        const response = await searchDocuments(currentSearchTerm || '');
        setDocuments(response.data);
        return;
    }
    const newFilters = { ...selectedFilters, [category]: value };
    setSelectedFilters(newFilters);
    setIsLoading(true);
    try {
        const response = await filterDocuments(newFilters);
        setDocuments(response.data);
    } catch(e) { console.error(e); } finally { setIsLoading(false); }
  };

  // --- VIEW: LANDING PAGE (HERO) ---
  if (isHeroMode) {
    const safeTrending = Array.isArray(popularSearches) ? popularSearches : [];

    return (
      <main className="min-h-[calc(100vh-76px)] flex flex-col animate-fade-in relative">
        {/* The background logic here changes. 
            We use the global background set in CSS variables, 
            but add a gradient OVERLAY so text is readable. 
        */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 z-0 pointer-events-none" />

        <div className="flex-grow flex flex-col items-center justify-center px-4 text-center relative z-10 py-20">
            <div className="max-w-4xl w-full space-y-10">
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg">
                        Archivia
                    </h1>
                    <p className="text-xl md:text-2xl text-indigo-100 font-light max-w-2xl mx-auto drop-shadow-md">
                        Your central repository for academic excellence. <br/>Access papers, journals, and articles instantly.
                    </p>
                </div>

                {/* Modern Hero Search Bar */}
                <div className="bg-white/95 p-3 rounded-2xl shadow-2xl flex items-center max-w-2xl mx-auto transition-all focus-within:ring-4 focus-within:ring-indigo-500/30 focus-within:scale-[1.01]">
                    <span className="pl-4 text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </span>
                    <input 
                        type="text" 
                        placeholder="Search title, author, or keywords..." 
                        className="flex-grow px-4 py-3 text-gray-800 bg-transparent focus:outline-none text-lg font-medium placeholder:text-gray-400"
                        value={heroInput} 
                        onChange={(e) => setHeroInput(e.target.value)} 
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch(heroInput);
                        }}
                    />
                    <button 
                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md active:transform active:scale-95"
                        onClick={() => handleSearch(heroInput)} 
                    >
                        Search
                    </button>
                </div>

                {/* Tags */}
                {safeTrending.length > 0 && (
                    <div className="pt-4 animate-fade-in delay-150">
                        <p className="text-xs text-indigo-200 mb-4 uppercase tracking-widest font-semibold">Trending Topics</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {safeTrending.slice(0, 5).map((item, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handleSearch(item.term || item)}
                                    className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md border border-white/20 text-sm text-white transition hover:border-white/40"
                                >
                                    {item.term || item}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="relative z-10 bg-white/90 backdrop-blur-sm py-8 border-t border-white/20 text-center">
            <p className="text-gray-600 mb-3 font-medium">Explore the entire collection</p>
            <button 
                onClick={handleBrowseAll}
                className="text-indigo-600 font-bold hover:text-indigo-800 flex items-center justify-center gap-2 mx-auto group"
            >
                Browse All Documents 
                <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
            </button>
        </div>
      </main>
    );
  }

  // --- VIEW: RESULTS LIST (APP MODE) ---
  return (
    <main className="container mx-auto p-4 md:p-8 min-h-screen animate-fade-in">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-gray-200/50 shadow-sm">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Library Results</h1>
            {/* FIXED QUOTES BELOW */}
            <p className="text-gray-500 text-sm mt-1">Found results for <span className="font-semibold text-indigo-600">&quot;{currentSearchTerm}&quot;</span></p>
        </div>
        <button 
            onClick={() => router.push('/')}
            className="text-sm font-medium text-gray-600 hover:text-indigo-600 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all flex items-center gap-2"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Search
        </button>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar */}
        <aside className="w-full lg:w-1/4 flex-shrink-0 lg:sticky lg:top-24">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 p-1">
                <FilterSidebar 
                    filters={availableFilters} 
                    selectedFilters={selectedFilters}
                    onFilterChange={handleFilterChange}
                />
            </div>
        </aside>

        {/* Results */}
        <div className="w-full lg:w-3/4">
            <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-1">
                <DocumentList 
                documents={documents} 
                isLoading={isLoading}
                searchPerformed={true} 
                onSearch={handleSearch}
                popularSearches={popularSearches}
                initialSearchTerm={currentSearchTerm || ''}
                />
            </div>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>}>
      <HomeContent />
    </Suspense>
  );
}