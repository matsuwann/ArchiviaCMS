'use client';

import { useState } from 'react';
import axios from 'axios'; 
import DocumentList from '../components/DocumentList';

export default function Home() {
  
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  
  const handleSearch = async (searchTerm) => {
    if (!searchTerm) {
      setDocuments([]);
      setSearchPerformed(false);
      return;
    }

    setIsLoading(true);
    setSearchPerformed(true);
    setDocuments([]); 

    try {
     
      const response = await axios.get(`http://localhost:3001/api/documents/search?term=${searchTerm}`);
      setDocuments(response.data);
    } catch (error) {
      console.error("Failed to fetch search results:", error);
      setDocuments([]); 
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
          A Capstone and Research Repository
        </p>
      </header>
      
      <div>
        <DocumentList 
          documents={documents} 
          isLoading={isLoading}
          searchPerformed={searchPerformed}
          onSearch={handleSearch}
        />
      </div>
    </main>
  );
}