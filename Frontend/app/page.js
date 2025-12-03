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
  
  // NEW: Controlled State for Hero Input
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
      // FIX 2: Ensure we always set an array to prevent .slice() crashes
      setPopularSearches(Array.isArray(popRes.data) ? popRes.data : []);
    }).catch(err => {
        console.error("Initial load error:", err);
        setPopularSearches([]); // Fallback to empty
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
    if (!term) return; // Prevent empty searches
    const cleanTerm = typeof term === 'string' ? term : String(term); // Safety cast
    router.push(`/?q=${encodeURIComponent(cleanTerm)}`);
  };

  const handleBrowseAll = () => {
    router.push('/?q='); 
  };

  const handleFilterChange = async (category, value) => {
    // ... (Your existing filter logic is fine, keeping it brief for the solution)
    if (category === 'reset') {
        setSelectedFilters({ authors: [], keywords: [], year: null, journal: [], dateRange: null });
        const response = await searchDocuments(currentSearchTerm || '');
        setDocuments(response.data);
        return;
    }
    // ... existing filter logic ...
    const newFilters = { ...selectedFilters, [category]: value };
    setSelectedFilters(newFilters);
    setIsLoading(true);
    // ... logic remains same ...
    try {
        // ...
        const response = await filterDocuments(newFilters);
        setDocuments(response.data);
    } catch(e) { console.error(e); } finally { setIsLoading(false); }
  };

  // --- VIEW: LANDING PAGE (HERO) ---
  if (isHeroMode) {
    // FIX 2 (Cont): Safety slice
    const safeTrending = Array.isArray(popularSearches) ? popularSearches : [];

    return (
      <main className="min-h-screen flex flex-col bg-white animate-fade-in">
        <div 
            className="flex-grow flex flex-col items-center justify-center px-4 text-center relative"
            style={{
                background: 'linear-gradient(to bottom right, #1e1b4b, #312e81, #4338ca)',
                color: 'white'
            }}
        >
            <div className="max-w-3xl w-full z-10 space-y-8">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-2">
                    Archivia
                </h1>
                <p className="text-xl text-indigo-100 font-light mb-8">
                    Access academic papers, journals, and articles in one place.
                </p>

                {/* Hero Search Bar - FIX 1: Using State instead of DOM traversal */}
                <div className="bg-white p-2 rounded-full shadow-2xl flex items-center max-w-2xl mx-auto transition-transform hover:scale-[1.02] duration-200">
                    <span className="pl-4 text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </span>
                    <input 
                        type="text" 
                        placeholder="Search for papers, authors, or keywords..." 
                        className="flex-grow px-4 py-3 text-gray-800 bg-transparent focus:outline-none text-lg"
                        value={heroInput} 
                        onChange={(e) => setHeroInput(e.target.value)} // Controlled Input
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch(heroInput);
                        }}
                    />
                    <button 
                        className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition"
                        onClick={() => handleSearch(heroInput)} // Uses state variable
                    >
                        Search
                    </button>
                </div>

                {/* Quick Stats / Popular */}
                <div className="pt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <p className="text-sm text-indigo-200 mb-4 uppercase tracking-widest">Popular Searches</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {/* FIX 2: Safe mapping with safeguards for missing terms */}
                        {safeTrending.slice(0, 5).map((item, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleSearch(item.term || item)} // Handle object OR string
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm border border-white/20 text-sm transition"
                            >
                                {item.term || item}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                 <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[100px]"></div>
                 <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[100px]"></div>
            </div>
        </div>

        <div className="bg-gray-50 py-12 border-t border-gray-200 text-center">
            <p className="text-gray-600 mb-4">Want to browse the full repository?</p>
            <button 
                onClick={handleBrowseAll}
                className="text-indigo-600 font-bold hover:underline"
            >
                View All Documents &rarr;
            </button>
        </div>
      </main>
    );
  }

  // --- VIEW: RESULTS LIST (APP MODE) ---
  return (
    <main className="container mx-auto p-4 md:p-6 bg-slate-50 min-h-screen animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Archivia Library</h1>
        <button 
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-indigo-600 underline flex items-center gap-1"
        >
            <span>&larr;</span> Back to Home
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <aside className="w-full md:w-1/4 flex-shrink-0">
            <FilterSidebar 
                filters={availableFilters} 
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
            />
        </aside>

        <div className="w-full md:w-3/4">
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
    <Suspense fallback={<div className="p-10 text-center">Loading Archivia...</div>}>
      <HomeContent />
    </Suspense>
  );
}