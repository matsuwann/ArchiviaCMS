'use client';

import { useEffect, useState } from 'react';
import EditDocumentModal from '../../../components/EditDocumentModal'; 
import { searchDocuments, adminDeleteDocument, adminArchiveDocument } from '../../../services/apiService'; // Added adminArchiveDocument
import { useAuth } from '../../../context/AuthContext'; // Get auth info
import { toast } from 'react-hot-toast';

export default function AdminDocumentManagement() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  const { user } = useAuth(); // Get current user to check for super admin

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

  // This handles the Archive logic (similar to user-side delete request)
  const handleArchive = async (docId) => {
    const reason = window.prompt("Enter a reason for archiving this document:");
    if (reason === null) return; // Cancelled
    if (!reason.trim()) return toast.error("Reason is required.");

    try {
        await adminArchiveDocument(docId, reason);
        toast.success("Document archived/requested for deletion.");
        handleSearch(searchTerm);
    } catch (err) {
        console.error(err);
        toast.error("Failed to archive document.");
    }
  };

  // Only Super Admins can call this
  const handlePermanentDelete = async (docId) => {
    if(!confirm("Are you sure? This is permanent and bypasses archive.")) return;
    
    try {
        await adminDeleteDocument(docId);
        toast.success("Document permanently deleted.");
        handleSearch(searchTerm);
    } catch (err) {
        console.error(err);
        toast.error("Failed to delete document.");
    }
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
        <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className="text-3xl font-bold text-gray-900">
            Document Management
            </h2>
            {user?.is_super_admin && (
                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded">Super Admin Mode</span>
            )}
        </div>
        
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
              const isPending = doc.deletion_requested; // Assuming this field comes back from API

              return (
                <li key={doc.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                        {doc.title || "Untitled"}
                        {isPending && <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">Archive Requested</span>}
                    </p>
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
                    
                    {/* LOGIC: Regular admins see 'Archive', Super admins see 'Delete' (or both if you prefer) */}
                    {user?.is_super_admin ? (
                        <button
                            onClick={() => handlePermanentDelete(doc.id)}
                            className="py-1 px-3 bg-red-800 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-red-900"
                        >
                            Delete (Super)
                        </button>
                    ) : (
                        <button
                            onClick={() => handleArchive(doc.id)}
                            disabled={isPending}
                            className={`py-1 px-3 text-white text-sm font-semibold rounded-lg shadow-md ${isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
                        >
                            {isPending ? 'Pending' : 'Archive'}
                        </button>
                    )}
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