'use client';
import { useState, useEffect } from 'react';
import { 
    getArchiveRequests, adminApproveArchive, adminRejectArchive,
    getUserArchiveRequests, adminApproveUserArchive, adminRejectUserArchive
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
    if (!authLoading && (!user || !user.is_super_admin)) router.push('/admin/documents');
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      const [docRes, userRes] = await Promise.all([getArchiveRequests(), getUserArchiveRequests()]);
      setDocRequests(docRes.data);
      setUserRequests(userRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { if(user?.is_super_admin) fetchData(); }, [user]);

  const handleAction = async (type, action, id, apiFunc) => {
      if(action === 'approve' && !confirm("Are you sure?")) return;
      try {
          await apiFunc(id);
          toast.success("Success");
          if(type === 'doc') setDocRequests(p => p.filter(r => r.id !== id));
          else setUserRequests(p => p.filter(r => r.id !== id));
      } catch(e) { toast.error("Failed"); }
  };

  if (!user?.is_super_admin) return null;

  const RequestCard = ({ title, subtitle, reason, onApprove, onReject, color }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color} flex flex-col md:flex-row justify-between items-center gap-4`}>
        <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900">{title}</h3>
            <p className="text-xs text-gray-400 mb-2">{subtitle}</p>
            {/* FIXED QUOTES BELOW */}
            <div className={`p-2 rounded bg-opacity-10 text-sm italic inline-block ${color.replace('border-l-', 'bg-').replace('500', '50')}`}>
                &quot;{reason}&quot;
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={onReject} className="px-4 py-2 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200 transition">Dismiss</button>
            <button onClick={onApprove} className={`px-4 py-2 text-white font-bold rounded-lg shadow-md transition ${color.replace('border-l-', 'bg-').replace('500', '600')} hover:opacity-90`}>Approve</button>
        </div>
    </div>
  );

  return (
    <div className="p-6 space-y-10">
      
      {/* DOCUMENTS */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Document Archive Requests
        </h2>
        {loading ? <p className="text-gray-400">Loading...</p> : docRequests.length === 0 ? <p className="text-gray-400 text-sm">No pending document requests.</p> : (
            <div className="grid gap-4">
                {docRequests.map(req => (
                    <RequestCard key={req.id} title={req.title} subtitle={req.filename} reason={req.archive_reason} color="border-l-indigo-500" 
                        onApprove={() => handleAction('doc', 'approve', req.id, adminApproveArchive)}
                        onReject={() => handleAction('doc', 'reject', req.id, adminRejectArchive)}
                    />
                ))}
            </div>
        )}
      </div>

      {/* USERS */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span> User Archive Requests
        </h2>
        {loading ? <p className="text-gray-400">Loading...</p> : userRequests.length === 0 ? <p className="text-gray-400 text-sm">No pending user requests.</p> : (
            <div className="grid gap-4">
                {userRequests.map(req => (
                    <RequestCard key={req.id} title={`${req.first_name} ${req.last_name}`} subtitle={req.email} reason={req.archive_reason} color="border-l-orange-500"
                        onApprove={() => handleAction('user', 'approve', req.id, adminApproveUserArchive)}
                        onReject={() => handleAction('user', 'reject', req.id, adminRejectUserArchive)}
                    />
                ))}
            </div>
        )}
      </div>
    </div>
  );
}