'use client';

import { useEffect, useState } from 'react';
import EditDocumentModal from '../../../components/EditDocumentModal'; 
import { searchDocuments, adminDeleteDocument, adminArchiveDocument, adminUpdateDocument } from '../../../services/apiService'; 
import { useAuth } from '../../../context/AuthContext'; 
import { toast } from 'react-hot-toast';

export default function AdminDocumentManagement() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const { user } = useAuth(); 

  useEffect(() => { handleSearch(''); }, []);

  const handleSearch = async (term) => {
    try {
      setLoading(true);
      const response = await searchDocuments(term); 
      setDocuments(response.data);
    } catch (err) { toast.error('Failed to fetch documents.'); } 
    finally { setLoading(false); }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const handleArchive = async (docId) => {
    const reason = window.prompt("Reason for archiving:");
    if (!reason?.trim()) return;
    try {
        await adminArchiveDocument(docId, reason);
        toast.success("Archived successfully.");
        handleSearch(searchTerm);
    } catch (err) { toast.error("Action failed."); }
  };

  const handlePermanentDelete = async (docId) => {
    if(!confirm("Permanently delete this document?")) return;
    try {
        await adminDeleteDocument(docId);
        toast.success("Deleted.");
        handleSearch(searchTerm);
    } catch (err) { toast.error("Delete failed."); }
  };

  const handleEdit = (doc) => { setSelectedDocument(doc); setIsModalOpen(true); };

  const handleSave = async (docId, updatedData) => {
    try {
        await adminUpdateDocument(docId, updatedData);
        setIsModalOpen(false);
        toast.success('Document updated.');
        handleSearch(searchTerm); 
    } catch (error) { toast.error("Save failed."); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Documents</h2>
            <p className="text-slate-500 text-sm mt-1">Manage repository content</p>
          </div>
          {user?.is_super_admin && (
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Super Admin Mode</span>
          )}
      </div>
      
      <form onSubmit={handleSearchSubmit} className="relative">
          <input
              type="text"
              placeholder="Search by title, author, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-32 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <button type="submit" className="absolute right-2 top-2 bottom-2 px-6 bg-slate-900 text-white font-bold rounded-lg hover:bg-indigo-600 transition-colors text-sm">
              Search
          </button>
      </form>

      {loading ? (
          <div className="text-center p-10 text-slate-400">Loading library...</div>
      ) : documents.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl border border-dashed border-slate-200 text-slate-500">No documents found.</div>
      ) : (
        <div className="grid gap-4">
          {documents.map(doc => {
            const isPending = doc.deletion_requested;
            return (
              <div key={doc.id} className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                      {doc.title || "Untitled"}
                      {isPending && <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Pending Archive</span>}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {doc.ai_authors?.length > 0 ? doc.ai_authors.join(', ') : 'Unknown Author'} • {doc.ai_date_created || 'No Date'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleEdit(doc)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">Edit</button>
                  <div className="h-4 w-px bg-slate-200"></div>
                  {user?.is_super_admin ? (
                      <button onClick={() => handlePermanentDelete(doc.id)} className="text-sm font-semibold text-red-600 hover:text-red-800">Delete</button>
                  ) : (
                      <button onClick={() => handleArchive(doc.id)} disabled={isPending} className={`text-sm font-semibold ${isPending ? 'text-slate-300' : 'text-slate-500 hover:text-red-600'}`}>
                          {isPending ? 'Requested' : 'Archive'}
                      </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {isModalOpen && <EditDocumentModal document={selectedDocument} onClose={() => setIsModalOpen(false)} onSave={handleSave}/>}
    </div>
  );
}