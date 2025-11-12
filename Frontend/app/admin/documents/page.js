'use client';

import { useEffect, useState } from 'react';
import EditDocumentModal from '../../../components/EditDocumentModal'; 
import { searchDocuments, adminDeleteDocument, adminUpdateDocument } from '../../../services/apiService';

export default function AdminDocumentManagement() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    // Fetch all documents on initial load
    handleSearch('');
  }, []);

  const handleSearch = async (term) => {
    try {
      setLoading(true);
      const response = await searchDocuments(term); //
      setDocuments(response.data);
    } catch (err) {
      setError('Failed to fetch documents.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document? This is permanent.")) {
      return;
    }
    try {
      await adminDeleteDocument(docId);
      alert('Document deleted.');
      handleSearch(searchTerm); // Refresh the list
    } catch (err) {
      alert("Failed to delete document.");
      console.error(err);
    }
  };

  const handleEdit = (doc) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

  // This function is passed to the modal
  const handleSave = async (docId, updatedData) => {
    try {
        await adminUpdateDocument(docId, updatedData);
        setIsModalOpen(false);
        alert('Document updated.');
        handleSearch(searchTerm); // Refresh the list
    } catch (error) {
        console.error("Failed to save:", error);
        alert("Failed to save changes.");
    }
  };

  return (
    <>
      <div className="p-8 bg-white rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-2">
          Document Management
        </h2>
        
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-6">
            <input
                type="text"
                placeholder="Search all documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
            <button type="submit" className="py-2 px-4 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700">
                Search
            </button>
        </form>

        {/* Document List */}
        {loading ? (
            <p className="text-center">Loading documents...</p>
        ) : error ? (
            <p className="text-center text-red-500">{error}</p>
        ) : documents.length === 0 ? (
            <p className="text-center">No documents found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {documents.map(doc => {
              const aiAuthors = doc.ai_authors || [];
              return (
                <li key={doc.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-lg font-medium text-gray-900">{doc.title || "Untitled"}</p>
                    <p className="text-sm text-gray-600">
                      {aiAuthors.length > 0 ? aiAuthors.join(', ') : 'No authors'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Date: {doc.ai_date_created || 'N/A'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(doc)}
                      className="py-1 px-3 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="py-1 px-3 bg-red-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      
      {/* Edit Modal (re-used) */}
      {isModalOpen && (
        <EditDocumentModal 
          document={selectedDocument} 
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}