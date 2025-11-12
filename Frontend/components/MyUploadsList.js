'use client';

import { useEffect, useState } from 'react';
import EditDocumentModal from './EditDocumentModal'; 
import { getMyUploads, deleteDocument, updateDocument } from '../services/apiService';
import { toast } from 'react-hot-toast'; 

export default function MyUploadsList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

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
    const deletePromise = deleteDocument(docId);
    
    toast.promise(
      deletePromise,
      {
        loading: 'Deleting document...',
        success: () => {
          setDocuments(documents.filter(doc => doc.id !== docId));
          return 'Document deleted successfully.';
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