'use client';

import { useState, useEffect } from 'react';
import DocumentList from '../components/DocumentList';
import FilterSidebar from '../components/FilterSidebar';
import { searchDocuments, getFilters, filterDocuments, getPopularSearches } from '../services/apiService';

export default function Home() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Filter & Analytics State
  const [availableFilters, setAvailableFilters] = useState({ authors: [], keywords: [], years: [], journals: [] });
  const [selectedFilters, setSelectedFilters] = useState({ authors: [], keywords: [], year: null, journal: [], dateRange: null });
  const [popularSearches, setPopularSearches] = useState([]);

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
    setSearchPerformed(!!searchTerm);
    setSelectedFilters({ authors: [], keywords: [], year: null, journal: [], dateRange: null });

    try {
      const response = await searchDocuments(searchTerm);
      setDocuments(response.data);
      
      // Update analytics
      if(searchTerm) {
          getPopularSearches().then(res => setPopularSearches(res.data));
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

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Archivia 🔎
        </h1>
        <p className="mt-2 text-lg text-gray-500">
          Advanced Research Repository
        </p>
      </header>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-1/4">
            <FilterSidebar 
                filters={availableFilters} 
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
            />
        </aside>

        {/* Main Content */}
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