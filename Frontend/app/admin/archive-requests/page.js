'use client';
import { useState, useEffect } from 'react';
import { 
    getArchiveRequests, 
    adminApproveArchive, 
    adminRejectArchive,
    getUserArchiveRequests,
    adminApproveUserArchive,
    adminRejectUserArchive
} from '../../../services/apiService';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function AdminArchiveRequestsPage() {
  const [docRequests, setDocRequests] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || !user.is_super_admin)) {
        router.push('/admin/documents');
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      const [docRes, userRes] = await Promise.all([
          getArchiveRequests(),
          getUserArchiveRequests()
      ]);
      setDocRequests(docRes.data);
      setUserRequests(userRes.data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(user?.is_super_admin) fetchData();
  }, [user]);

  // DOCUMENT HANDLERS
  const handleApproveDoc = async (id) => {
    if(!confirm("Permanently delete this file?")) return;
    try {
        await adminApproveArchive(id);
        toast.success("File deleted.");
        setDocRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
        toast.error("Failed.");
    }
  };

  const handleRejectDoc = async (id) => {
    try {
        await adminRejectArchive(id);
        toast.success("Request rejected.");
        setDocRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
        toast.error("Failed.");
    }
  };

  // USER HANDLERS
  const handleApproveUser = async (id) => {
    if(!confirm("Archive (Deactivate) this user?")) return;
    try {
        await adminApproveUserArchive(id);
        toast.success("User deactivated.");
        setUserRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
        toast.error("Failed.");
    }
  };

  const handleRejectUser = async (id) => {
    try {
        await adminRejectUserArchive(id);
        toast.success("Request rejected.");
        setUserRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
        toast.error("Failed.");
    }
  };

  if (!user?.is_super_admin) return null;

  return (
    <div className="p-6 space-y-10">
      
      {/* SECTION 1: DOCUMENT REQUESTS */}
      <div>
        <h1 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Document Archive Requests</h1>
        {loading ? <p>Loading...</p> : docRequests.length === 0 ? (
            <p className="text-gray-500 italic">No pending document requests.</p>
        ) : (
            <div className="grid gap-4">
            {docRequests.map(req => (
                <div key={req.id} className="bg-white p-6 rounded-lg shadow-md border border-l-4 border-l-indigo-500 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{req.title}</h3>
                        <p className="text-xs text-gray-400 mb-1">{req.filename}</p>
                        {/* FIXED: Replaced " with &quot; */}
                        <p className="text-sm text-gray-600">Reason: <span className="italic text-gray-800">&quot;{req.archive_reason}&quot;</span></p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => handleRejectDoc(req.id)} className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded hover:bg-gray-300">Keep</button>
                        <button onClick={() => handleApproveDoc(req.id)} className="px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 shadow">Delete</button>
                    </div>
                </div>
            ))}
            </div>
        )}
      </div>

      {/* SECTION 2: USER REQUESTS */}
      <div>
        <h1 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">User Archive Requests</h1>
        {loading ? <p>Loading...</p> : userRequests.length === 0 ? (
            <p className="text-gray-500 italic">No pending user requests.</p>
        ) : (
            <div className="grid gap-4">
            {userRequests.map(req => (
                <div key={req.id} className="bg-white p-6 rounded-lg shadow-md border border-l-4 border-l-orange-500 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{req.first_name} {req.last_name}</h3>
                        <p className="text-xs text-gray-400 mb-1">{req.email}</p>
                        {/* FIXED: Replaced " with &quot; */}
                        <p className="text-sm text-gray-600">Reason: <span className="italic text-gray-800">&quot;{req.archive_reason}&quot;</span></p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => handleRejectUser(req.id)} className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded hover:bg-gray-300">Keep Active</button>
                        <button onClick={() => handleApproveUser(req.id)} className="px-4 py-2 bg-orange-600 text-white font-bold rounded hover:bg-orange-700 shadow">Deactivate</button>
                    </div>
                </div>
            ))}
            </div>
        )}
      </div>

    </div>
  );
}