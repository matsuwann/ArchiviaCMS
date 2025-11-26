'use client';

import { useEffect, useState } from 'react';
import EditDocumentModal from './EditDocumentModal'; 
// Added requestDeletion to imports
import { getMyUploads, deleteDocument, updateDocument, requestDeletion } from '../services/apiService';
import { toast } from 'react-hot-toast'; 

export default function MyUploadsList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // --- NEW STATE FOR DELETION REQUEST ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const response = await getMyUploads();
      setDocuments(response.data);
    } catch (err) {
      setError('Failed to fetch your documents.');
      toast.error('Failed to fetch your documents.'); 
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doc) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

  const handleSave = async (docId, updatedData) => {
    const savePromise = updateDocument(docId, updatedData);
    
    await toast.promise(
      savePromise,
      {
        loading: 'Saving changes...',
        success: 'Changes saved successfully!',
        error: 'Failed to save changes.'
      }
    );

    try {
      await savePromise; 
      await fetchUploads();
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  // --- NEW DELETION LOGIC ---

  const handleDeleteClick = (doc) => {
    if (doc.deletion_requested) {
        toast("Deletion already requested for this file. Waiting for admin approval.");
        return;
    }
    setDocToDelete(doc);
    setDeleteReason("");
    setIsDeleteModalOpen(true);
  };

  const submitDeleteRequest = async (e) => {
    e.preventDefault();
    if (!deleteReason.trim()) return toast.error("Please provide a reason.");

    const promise = requestDeletion(docToDelete.id, deleteReason);
    
    toast.promise(promise, {
        loading: 'Sending request...',
        success: 'Request sent to admin!',
        error: 'Failed to send request.'
    });

    try {
        await promise;
        setIsDeleteModalOpen(false);
        setDocToDelete(null);
        // Refresh list to update the button status to "Pending..."
        await fetchUploads(); 
    } catch (err) {
        console.error(err);
    }
  };
  
  if (loading) return <p className="text-center">Loading your uploads...</p>;
  if (error && documents.length === 0) return <p className="text-center text-red-500">{error}</p>;

  return (
    <>
      <div className="p-8 bg-white rounded-xl shadow-2xl">
        {documents.length === 0 ? (
          <p className="text-center">You have not uploaded any documents yet.</p>
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
                    <a
                        href={doc.filepath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline mt-2 inline-block"
                    >
                        View PDF
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(doc)}
                      className="py-1 px-3 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    
                    {/* Updated Delete Button */}
                    <button
                      onClick={() => handleDeleteClick(doc)}
                      disabled={doc.deletion_requested}
                      className={`py-1 px-3 text-sm font-semibold rounded-lg shadow-md transition-colors ${
                        doc.deletion_requested 
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      {doc.deletion_requested ? "Pending..." : "Delete"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      
      {/* Edit Modal */}
      {isModalOpen && (
        <EditDocumentModal 
          document={selectedDocument} 
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {/* Request Deletion Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
                <h3 className="text-lg font-bold mb-2">Request Deletion</h3>
                <p className="text-gray-600 mb-4 text-sm">
                    Please tell the admin why you want to delete <span className="font-semibold">{docToDelete?.title}</span>.
                </p>
                <form onSubmit={submitDeleteRequest}>
                    <textarea
                        className="w-full border border-gray-300 rounded p-2 mb-4 focus:ring-2 ring-indigo-500 outline-none min-h-[100px]"
                        placeholder="Reason for deletion..."
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        required
                    />
                    <div className="flex justify-end gap-2">
                        <button 
                            type="button"
                            onClick={() => setIsDeleteModalOpen(false)} 
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 shadow-sm"
                        >
                            Send Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </>
  );
}