'use client';
import { useState, useEffect } from 'react';
import { getDeletionRequests, adminApproveDeletion, adminRejectDeletion } from '../../../services/apiService';
import { toast } from 'react-hot-toast';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await getDeletionRequests();
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    if(!confirm("Are you sure you want to permanently delete this file?")) return;
    try {
        await adminApproveDeletion(id);
        toast.success("File deleted successfully");
        setRequests(requests.filter(r => r.id !== id));
    } catch (err) {
        toast.error("Failed to delete file");
    }
  };

  const handleReject = async (id) => {
    try {
        await adminRejectDeletion(id);
        toast.success("Request rejected");
        setRequests(requests.filter(r => r.id !== id));
    } catch (err) {
        toast.error("Failed to reject request");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Deletion Requests</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            No pending deletion requests.
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="font-bold text-lg text-indigo-700">{req.title}</h3>
                    <p className="text-xs text-gray-400 mb-2">{req.filename}</p>
                    <div className="bg-red-50 p-3 rounded border border-red-100">
                        <p className="text-sm text-red-800 font-semibold">Reason provided:</p>
                        <p className="text-gray-700 italic">&quot;{req.deletion_reason}&quot;</p>
                    </div>
                </div>
                
                <div className="flex gap-3 shrink-0">
                    <button 
                        onClick={() => handleReject(req.id)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded hover:bg-gray-300 transition"
                    >
                        Deny
                    </button>
                    <button 
                        onClick={() => handleApprove(req.id)}
                        className="px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 shadow transition"
                    >
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