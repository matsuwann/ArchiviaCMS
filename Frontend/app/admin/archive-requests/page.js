'use client';
import { useState, useEffect } from 'react';
import { getUserArchiveRequests, adminApproveUserArchive, adminRejectUserArchive } from '../../../services/apiService';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function AdminArchiveRequestsPage() {
  const [userRequests, setUserRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || !user.is_super_admin)) router.push('/admin/documents');
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      const res = await getUserArchiveRequests();
      setUserRequests(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { if(user?.is_super_admin) fetchData(); }, [user]);

  const handleAction = async (apiFunc, id, successMsg) => {
    try {
        await apiFunc(id);
        toast.success(successMsg);
        setUserRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) { toast.error("Action failed."); }
  };

  if (!user?.is_super_admin) return null;

  const RequestCard = ({ title, sub, reason, onApprove, onReject, colorClass, btnText }) => (
    <div className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${colorClass} border-y border-r border-slate-100 flex flex-col md:flex-row justify-between items-start gap-4`}>
        <div className="flex-grow">
            <h3 className="font-bold text-lg text-slate-800">{title}</h3>
            <p className="text-xs text-slate-400 font-mono mb-3">{sub}</p>
            <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 italic">&quot;{reason}&quot;</p>
        </div>
        <div className="flex gap-3 shrink-0">
            <button onClick={onReject} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition">Reject</button>
            <button onClick={onApprove} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 shadow transition">{btnText}</button>
        </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">User Archive Requests</h1>
        <p className="text-slate-500 text-sm mt-1">Review requests to deactivate or archive user accounts</p>
      </div>

      {loading ? <p className="text-center text-slate-400">Loading requests...</p> : userRequests.length === 0 ? (
          <div className="p-10 bg-white rounded-xl border border-slate-100 text-center text-slate-500 italic">No pending user requests.</div>
      ) : (
          <div className="grid gap-4">
          {userRequests.map(req => (
              <RequestCard 
                  key={req.id} 
                  title={`${req.first_name} ${req.last_name}`} 
                  sub={req.email} 
                  reason={req.archive_reason}
                  colorClass="border-l-orange-500" 
                  btnText="Deactivate User"
                  onReject={() => handleAction(adminRejectUserArchive, req.id, "Rejected")}
                  onApprove={() => { if(confirm("Deactivate user?")) handleAction(adminApproveUserArchive, req.id, "Deactivated"); }}
              />
          ))}
          </div>
      )}
    </div>
  );
}