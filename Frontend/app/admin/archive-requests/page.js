'use client';
import { useState, useEffect } from 'react';
import { getArchiveRequests, adminApproveArchive, adminRejectArchive, getUserArchiveRequests, adminApproveUserArchive, adminRejectUserArchive } from '../../../services/apiService';
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

  const handleAction = async (apiFunc, id, setFunc, successMsg) => {
    try {
        await apiFunc(id);
        toast.success(successMsg);
        setFunc(prev => prev.filter(r => r.id !== id));
    } catch (err) { toast.error("Action failed."); }
  };

  if (!user?.is_super_admin) return null;

  const RequestCard = ({ title, sub, reason, onApprove, onReject, colorClass, btnText }) => (
    <div className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${colorClass} border-y border-r border-slate-100 flex flex-col md:flex-row justify-between items-start gap-4`}>
        <div className="flex-grow">
            <h3 className="font-bold text-lg text-slate-800">{title}</h3>
            <p className="text-xs text-slate-400 font-mono mb-3">{sub}</p>
            {/* FIXED: Quotes escaped */}
            <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 italic">&quot;{reason}&quot;</p>
        </div>
        <div className="flex gap-3 shrink-0">
            <button onClick={onReject} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50">Reject</button>
            <button onClick={onApprove} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 shadow">{btnText}</button>
        </div>
    </div>
  );

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">Document Archives</h2>
        {loading ? <p>Loading...</p> : docRequests.length === 0 ? <p className="text-slate-400 italic">No pending requests.</p> : (
            <div className="grid gap-4">
            {docRequests.map(req => (
                <RequestCard 
                    key={req.id} title={req.title} sub={req.filename} reason={req.archive_reason}
                    colorClass="border-l-indigo-500" btnText="Confirm Delete"
                    onReject={() => handleAction(adminRejectArchive, req.id, setDocRequests, "Rejected")}
                    onApprove={() => { if(confirm("Delete file?")) handleAction(adminApproveArchive, req.id, setDocRequests, "Deleted"); }}
                />
            ))}
            </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">User Archives</h2>
        {loading ? <p>Loading...</p> : userRequests.length === 0 ? <p className="text-slate-400 italic">No pending requests.</p> : (
            <div className="grid gap-4">
            {userRequests.map(req => (
                <RequestCard 
                    key={req.id} title={`${req.first_name} ${req.last_name}`} sub={req.email} reason={req.archive_reason}
                    colorClass="border-l-orange-500" btnText="Deactivate User"
                    onReject={() => handleAction(adminRejectUserArchive, req.id, setUserRequests, "Rejected")}
                    onApprove={() => { if(confirm("Deactivate user?")) handleAction(adminApproveUserArchive, req.id, setUserRequests, "Deactivated"); }}
                />
            ))}
            </div>
        )}
      </section>
    </div>
  );
}