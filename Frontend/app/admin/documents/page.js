'use client';

import { useEffect, useState } from 'react';
import EditDocumentModal from '../../../components/EditDocumentModal'; 
import { searchDocuments, adminDeleteDocument, adminUpdateDocument } from '../../../services/apiService';
import { toast } from 'react-hot-toast';

export default function AdminDocumentManagement() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {

    handleSearch('');
  }, []);

  const handleSearch = async (term) => {
    try {
      setLoading(true);
      const response = await searchDocuments(term); 
      setDocuments(response.data);
    } catch (err) {
      setError('Failed to fetch documents.');
      toast.error('Failed to fetch documents.');
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
    toast((t) => (
      <span className="flex flex-col gap-2">
        Are you sure you want to delete this?
        <div className="flex gap-2">
          <button
            className="w-full py-1 px-3 bg-red-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-red-700"
            onClick={() => {
              toast.dismiss(t.id);
              performDelete(docId);
            }}
          >
            Delete
          </button>
          <button
            className="w-full py-1 px-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </span>
    ), { duration: 6000 });
  };

  const performDelete = async (docId) => {
    const deletePromise = adminDeleteDocument(docId);
    toast.promise(
      deletePromise,
      {
        loading: 'Deleting document...',
        success: () => {
          handleSearch(searchTerm);
          return 'Document deleted.';
        },
        error: (err) => {
          console.error(err);
          return 'Failed to delete document.';
        }
      }
    );
  };

  const handleEdit = (doc) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

  const handleSave = async (docId, updatedData) => {
    try {
        await adminUpdateDocument(docId, updatedData);
        setIsModalOpen(false);
        toast.success('Document updated.');
        handleSearch(searchTerm); 
    } catch (error) {
        console.error("Failed to save:", error);
        toast.error("Failed to save changes.");
    }
  };

  return (
    <>
      <div className="p-8 bg-white rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-2">
          Document Management
        </h2>
        
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