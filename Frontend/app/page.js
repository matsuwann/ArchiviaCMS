'use client';

import { useState, useEffect } from 'react';
import DocumentList from '../components/DocumentList';
import FilterSidebar from '../components/FilterSidebar';
import { searchDocuments, getFilters, filterDocuments, getPopularSearches } from '../services/apiService';

export default function Home() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Data State
  const [availableFilters, setAvailableFilters] = useState({ authors: [], keywords: [], years: [], journals: [] });
  const [popularSearches, setPopularSearches] = useState([]);
  
  // Selection State
  const [selectedFilters, setSelectedFilters] = useState({ authors: [], keywords: [], year: null, journal: [], dateRange: null });
a
  useEffect(() => {
    // Load EVERYTHING on initial page load
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
    setSearchPerformed(!!searchTerm);
    // Reset filters on new search text
    setSelectedFilters({ authors: [], keywords: [], year: null, journal: [], dateRange: null });

    try {
      const response = await searchDocuments(searchTerm);
      setDocuments(response.data);
      
      if(searchTerm) {
          // Refresh analytics after search
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
      // If filters cleared, load all
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

  return (
    <main className="container mx-auto p-4 md:p-6 bg-slate-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Archivia Library</h1>
      </header>
      
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* LEFT SIDEBAR (25% width) */}
        <aside className="w-full md:w-1/4 flex-shrink-0">
            <FilterSidebar 
                filters={availableFilters} 
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
            />
        </aside>

        {/* MAIN CONTENT (75% width) */}
        <div className="w-full md:w-3/4">
            <DocumentList 
              documents={documents} 
              isLoading={isLoading}
              searchPerformed={searchPerformed || documents.length > 0}
              onSearch={handleSearch}
              popularSearches={popularSearches}
            />
        </div>
      </div>
    </main>
  );
}