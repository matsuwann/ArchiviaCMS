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

  // Initial Data Load
  useEffect(() => {
    Promise.all([
      getFilters(),             
      getPopularSearches()      
    ]).then(([filtersRes, popRes]) => {
      setAvailableFilters(filtersRes.data || { authors: [], keywords: [], years: [], journals: [] });
      setPopularSearches(Array.isArray(popRes.data) ? popRes.data : []);
    }).catch(err => {
        console.error("Initial load error:", err);
        setPopularSearches([]);
    });
  }, []);

  // Trigger Search when URL changes
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

  // HANDLERS
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
      <main className="min-h-screen flex flex-col bg-white relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[120px] opacity-60"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[100px] opacity-70"></div>
            {/* Dot Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center px-4 text-center relative z-10 pt-10">
            <div className="max-w-3xl w-full space-y-10 animate-fade-in">
                
                {/* Brand Header */}
                <div className="space-y-4">
                    <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider border border-indigo-100 mb-2">
                        Institutional Repository
                    </span>
                    <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900">
                        Archivia
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">
                        Discover academic papers, journals, and research articles.
                    </p>
                </div>

                {/* Hero Search Bar */}
                <div className="relative group max-w-2xl mx-auto w-full">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
                    <div className="relative flex items-center bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                        <span className="pl-6 text-slate-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </span>
                        <input 
                            type="text" 
                            placeholder="Search by keyword, title, or author..." 
                            className="flex-grow px-4 py-5 text-lg text-slate-800 bg-transparent focus:outline-none placeholder-slate-400"
                            value={heroInput} 
                            onChange={(e) => setHeroInput(e.target.value)} 
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(heroInput); }}
                        />
                        <button 
                            className="mr-2 px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors shadow-lg"
                            onClick={() => handleSearch(heroInput)}
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Trending Pills */}
                <div className="pt-4">
                    <p className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-widest">Trending Topics</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {safeTrending.slice(0, 5).map((item, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleSearch(item.term || item)}
                                className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600 text-sm font-medium rounded-full hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all"
                            >
                                {item.term || item}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white/50 backdrop-blur-sm py-10 border-t border-slate-100 text-center z-10">
            <button 
                onClick={handleBrowseAll}
                className="text-indigo-600 font-bold hover:text-indigo-800 transition flex items-center justify-center gap-2 mx-auto"
            >
                Browse Full Library <span>&rarr;</span>
            </button>
        </div>
      </main>
    );
  }

  // --- VIEW: RESULTS LIST (APP MODE) ---
  return (
    <main className="container mx-auto p-4 md:p-8 min-h-screen animate-fade-in bg-slate-50/30">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Library Results</h1>
            <p className="text-slate-500 text-sm mt-1">
                Found {documents.length} {documents.length === 1 ? 'document' : 'documents'} matching your criteria.
            </p>
        </div>
        <button 
            onClick={() => router.push('/')}
            className="text-sm font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 hover:border-indigo-200 transition-all shadow-sm"
        >
            <span>&larr;</span> Back to Home
        </button>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <aside className="w-full lg:w-1/4 flex-shrink-0 sticky top-24">
            <FilterSidebar 
                filters={availableFilters} 
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
            />
        </aside>

        <div className="w-full lg:w-3/4">
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
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-slate-400 font-medium">Loading Archivia...</div>}>
      <HomeContent />
    </Suspense>
  );
}