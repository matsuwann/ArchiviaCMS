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
      <main className="min-h-screen flex flex-col bg-white relative overflow-x-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[100px] opacity-70"></div>
            <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        </div>

        {/* --- HERO SECTION --- */}
        <div className="flex-grow flex flex-col items-center justify-center px-4 text-center relative z-10 pt-20 pb-32">
            <div className="max-w-4xl w-full space-y-10 animate-fade-in">
                
                {/* Brand Header */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white border border-indigo-100 shadow-sm mb-4">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Institutional Repository</span>
                    </div>
                    <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
                        Archivia
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">
                        A centralized platform for discovering academic papers, journals, and cutting-edge research.
                    </p>
                </div>

                {/* Hero Search Bar */}
                <div className="relative group max-w-2xl mx-auto w-full">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl opacity-20 group-hover:opacity-30 blur-lg transition duration-500"></div>
                    <div className="relative flex items-center bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-transform group-hover:scale-[1.01]">
                        <span className="pl-6 text-slate-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </span>
                        <input 
                            type="text" 
                            placeholder="Search keywords, authors, or titles..." 
                            className="flex-grow px-4 py-5 text-lg text-slate-800 bg-transparent focus:outline-none placeholder-slate-400"
                            value={heroInput} 
                            onChange={(e) => setHeroInput(e.target.value)} 
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(heroInput); }}
                        />
                        <button 
                            className="mr-2 px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all duration-300 shadow-lg hover:shadow-indigo-500/30"
                            onClick={() => handleSearch(heroInput)}
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Trending Pills */}
                <div className="pt-6">
                    <p className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-widest">Trending Topics</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {safeTrending.slice(0, 5).map((item, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleSearch(item.term || item)}
                                className="px-5 py-2 bg-white/60 backdrop-blur-sm border border-slate-200 text-slate-600 text-sm font-semibold rounded-full hover:border-indigo-300 hover:text-indigo-600 hover:bg-white hover:shadow-md transition-all duration-200"
                            >
                                {item.term || item}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* --- NEW BOTTOM SECTION --- */}
        
        {/* 1. Dark CTA Strip */}
        <div className="bg-slate-900 text-white py-20 px-4 text-center z-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[80%] bg-indigo-500 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[-50%] right-[-20%] w-[80%] h-[80%] bg-blue-600 rounded-full blur-[150px]"></div>
            </div>
            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Expand Your Knowledge Base</h2>
                <p className="text-indigo-200 text-lg font-light leading-relaxed">
                    Join thousands of researchers and students accessing our comprehensive library of peer-reviewed documents.
                </p>
                <div className="pt-4">
                    <button 
                        onClick={handleBrowseAll}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-indigo-50 hover:scale-105 transition-all shadow-xl"
                    >
                        Browse Full Repository <span>&rarr;</span>
                    </button>
                </div>
            </div>
        </div>

        {/* 2. Professional Footer (Simplified & Copyright Removed) */}
        <footer className="bg-white border-t border-slate-200 pt-16 pb-16 z-10 relative text-slate-600">
            <div className="container mx-auto px-6 text-center">
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
                        <span className="text-xl font-bold text-slate-900">Archivia</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-500 max-w-lg mx-auto">
                        Archivia is a secure, open-access institutional repository designed to preserve and disseminate scholarly output. Empowering research through accessibility.
                    </p>
                </div>
            </div>
        </footer>
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