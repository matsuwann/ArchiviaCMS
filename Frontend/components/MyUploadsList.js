'use client';

import { useEffect, useState } from 'react';
import EditDocumentModal from './EditDocumentModal'; 
import RequestModal from './RequestModal'; // IMPORT NEW MODAL
import { getMyUploads, updateDocument, requestDeletion } from '../services/apiService';
import { toast } from 'react-hot-toast'; 

export default function MyUploadsList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // --- MODAL STATE ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

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
    await toast.promise(savePromise, {
        loading: 'Saving changes...',
        success: 'Changes saved successfully!',
        error: 'Failed to save changes.'
    });
    try { await savePromise; await fetchUploads(); } catch (error) { console.error(error); }
  };

  const handleDeleteClick = (doc) => {
    if (doc.deletion_requested) {
        toast("Deletion already requested for this file.");
        return;
    }
    setDocToDelete(doc);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitRequest = async (reason) => {
    if (!reason.trim()) return toast.error("Please provide a reason.");

    const promise = requestDeletion(docToDelete.id, reason);
    
    toast.promise(promise, {
        loading: 'Sending request...',
        success: 'Request sent to admin!',
        error: 'Failed to send request.'
    });

    try {
        await promise;
        setIsDeleteModalOpen(false);
        setDocToDelete(null);
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
            {documents.map(doc => (
                <li key={doc.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-lg font-medium text-gray-900">{doc.title || "Untitled"}</p>
                    <p className="text-sm text-gray-600">
                      {doc.ai_authors?.length > 0 ? doc.ai_authors.join(', ') : 'No authors'}
                    </p>
                    <p className="text-sm text-gray-500">Date: {doc.ai_date_created || 'N/A'}</p>
                    <a href={doc.filepath} target="_blank" className="text-sm text-blue-500 hover:underline mt-2 inline-block">View PDF</a>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(doc)} className="py-1 px-3 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700">Edit</button>
                    <button
                      onClick={() => handleDeleteClick(doc)}
                      disabled={doc.deletion_requested}
                      className={`py-1 px-3 text-sm font-semibold rounded-lg shadow-md transition-colors ${
                        doc.deletion_requested ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      {doc.deletion_requested ? "Pending..." : "Delete"}
                    </button>
                  </div>
                </li>
            ))}
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

      {/* REUSED REQUEST MODAL */}
      <RequestModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSubmit={handleSubmitRequest}
        title="Request Deletion"
        message={
            <p>Please tell the admin why you want to delete <span className="font-semibold">{docToDelete?.title}</span>.</p>
        }
        actionLabel="Send Request"
      />
    </>
  );
}