"use client";
import React, { useState } from 'react';
import Image from 'next/image';
// Import your existing components for the "Updated UI"
import DocumentList from '../components/DocumentList';
import FilterSidebar from '../components/FilterSidebar';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setHasSearched(true);
    }
  };

  // --- VIEW 1: UPDATED SEARCH UI (Only shown after search) ---
  if (hasSearched) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        {/* Sidebar for filters */}
        <div className="w-full md:w-64 flex-shrink-0">
          <FilterSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {/* Search bar at top of results to allow searching again */}
          <form onSubmit={handleSearch} className="mb-6 flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="flex-1 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button 
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
            <button 
              type="button"
              onClick={() => { setSearchQuery(''); setHasSearched(false); }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
          </form>

          <DocumentList query={searchQuery} />
        </div>
      </div>
    );
  }

  // --- VIEW 2: LANDING PAGE (Default - Matches your Image) ---
  return (
    <main className="flex flex-col items-center justify-center min-h-[85vh] bg-white px-4">
      
      {/* 1. Large Central Logo/Icon */}
      <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
        {/* Using window.svg as seen in your file list, or swap for system-brand-icon.png */}
        <Image 
          src="/window.svg" 
          alt="Archivia Brand" 
          width={120} 
          height={120} 
          className="opacity-90"
          priority
        />
      </div>

      {/* 2. Brand Name */}
      <h1 className="text-5xl font-bold text-gray-800 mb-12 tracking-tight">
        Archivia
      </h1>

      {/* 3. Central Search Bar */}
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg 
              className="h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-full text-lg placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:ring-opacity-50 transition-all shadow-sm hover:shadow-md"
            placeholder="Search for a document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute inset-y-2 right-2 bg-blue-600 text-white px-6 rounded-full font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Search
          </button>
        </form>
      </div>

      {/* Optional: Footer Text */}
      <p className="mt-8 text-gray-400 text-sm">
        Manage, archive, and discover your documents efficiently.
      </p>
    </main>
  );
}