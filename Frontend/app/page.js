'use client';

import { useState, useEffect } from 'react';
import DocumentList from '../components/DocumentList';

export default function Home() {
  const [documents, setDocuments] = useState([]);

  
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/documents');
        const data = await res.json();
        setDocuments(data);
      } catch (error) {
        console.error('Failed to fetch initial documents:', error);
      }
    };
    fetchDocs();
  }, []); 

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Archivia 
        </h1>
        <p className="mt-2 text-lg text-gray-500">
          A Capstone and Research Repository
        </p>
      </header>
      
      <div>
        <DocumentList documents={documents} setDocuments={setDocuments} />
      </div>
    </main>
  );
}