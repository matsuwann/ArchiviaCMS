'use client';
import { useState, useEffect } from 'react';
import { getDeletionRequests, adminApproveDeletion, adminRejectDeletion } from '../../../services/apiService';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || !user.is_super_admin)) {
        router.push('/admin/documents'); 
    }
  }, [user, authLoading, router]);

  const fetchRequests = async () => {
    try {
      const res = await getDeletionRequests();
      setRequests(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { if(user?.is_super_admin) fetchRequests(); }, [user]);

  const handleApprove = async (id) => {
    if(!confirm("Permanently delete this file?")) return;
    try { await adminApproveDeletion(id); toast.success("Deleted."); setRequests(requests.filter(r => r.id !== id)); } catch (err) { toast.error("Failed."); }
  };

  const handleReject = async (id) => {
    try { await adminRejectDeletion(id); toast.success("Rejected."); setRequests(requests.filter(r => r.id !== id)); } catch (err) { toast.error("Failed."); }
  };

  if (!user?.is_super_admin) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">User Deletion Requests</h1>
        <p className="text-sm text-gray-500">Users have requested to remove the following files.</p>
      </div>
      
      {loading ? <p className="text-center text-gray-400">Loading...</p> : requests.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed">No pending requests.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 flex flex-col md:flex-row justify-between items-start gap-4 animate-fade-in">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-900">{req.title}</h3>
                        <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">{req.filename}</span>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100 inline-block">
                        <span className="text-xs font-bold text-red-800 uppercase">Reason:</span>
                        {/* FIXED QUOTES HERE */}
                        <span className="text-sm text-red-900 ml-2 italic">&quot;{req.deletion_reason}&quot;</span>
                    </div>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => handleReject(req.id)} className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition">
                        Keep File
                    </button>
                    <button onClick={() => handleApprove(req.id)} className="flex-1 md:flex-none px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-md transition">
                        Approve Delete
                    </button>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}