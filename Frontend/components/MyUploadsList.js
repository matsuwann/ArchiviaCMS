'use client';

import { useEffect, useState } from 'react';
import EditDocumentModal from './EditDocumentModal'; 
import RequestModal from './RequestModal'; 
import { getMyUploads, updateDocument, requestDeletion } from '../services/apiService';
import { toast } from 'react-hot-toast'; 

export default function MyUploadsList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  useEffect(() => { fetchUploads(); }, []);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const response = await getMyUploads();
      setDocuments(response.data);
    } catch (err) {
      toast.error('Failed to fetch your documents.'); 
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
    toast.promise(savePromise, {
        loading: 'Saving changes...',
        success: 'Changes saved!',
        error: 'Failed to save.'
    });
    try { await savePromise; await fetchUploads(); } catch (error) { console.error(error); }
  };

  const handleDeleteClick = (doc) => {
    if (doc.deletion_requested) return toast("Deletion already requested.");
    setDocToDelete(doc);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitRequest = async (reason) => {
    if (!reason.trim()) return toast.error("Reason is required.");
    const promise = requestDeletion(docToDelete.id, reason);
    toast.promise(promise, { loading: 'Sending request...', success: 'Request sent!', error: 'Failed.' });
    try { await promise; setIsDeleteModalOpen(false); setDocToDelete(null); await fetchUploads(); } catch (err) {}
  };
  
  if (loading) return <div className="text-center py-20 text-gray-500 animate-pulse">Loading your library...</div>;

  return (
    <>
      <div className="space-y-6">
        {documents.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-2xl border-2 border-dashed border-gray-300">
            <div className="text-4xl mb-3">📂</div>
            <p className="text-gray-500 font-medium">You haven't uploaded any documents yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {documents.map(doc => (
                <div key={doc.id} className="glass-panel p-6 rounded-xl shadow-sm border border-white/50 hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 leading-tight">{doc.title || "Untitled"}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {doc.ai_authors?.join(', ') || 'Unknown Author'} • <span className="font-mono text-xs">{doc.ai_date_created || 'Date N/A'}</span>
                        </p>
                        <a href={doc.filepath} target="_blank" className="text-xs font-semibold text-indigo-600 hover:underline mt-2 inline-block">
                            View PDF &rarr;
                        </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button onClick={() => handleEdit(doc)} className="flex-1 md:flex-none py-2 px-4 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition">
                        Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(doc)}
                      disabled={doc.deletion_requested}
                      className={`flex-1 md:flex-none py-2 px-4 text-sm font-bold rounded-lg transition-colors ${
                        doc.deletion_requested 
                            ? "bg-orange-50 text-orange-600 border border-orange-100 cursor-not-allowed" 
                            : "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                      }`}
                    >
                      {doc.deletion_requested ? "Pending Deletion" : "Delete"}
                    </button>
                  </div>
                </div>
            ))}
          </div>
        )}
      </div>
      
      {isModalOpen && (
        <EditDocumentModal 
          document={selectedDocument} 
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

      <RequestModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSubmit={handleSubmitRequest}
        title="Request Deletion"
        message={<p className="text-gray-600">Why do you want to delete <span className="font-bold text-gray-900">{docToDelete?.title}</span>? This will be sent to an admin for approval.</p>}
        actionLabel="Send Request"
      />
    </>
  );
}