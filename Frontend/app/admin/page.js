'use client';

import { useEffect, useState } from 'react';
import { getAdminAnalytics } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAdminAnalytics();
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName}!
        </h2>
        <p className="text-gray-500">Here is an overview of the Archivia system performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Users */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Users</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats?.totalUsers || 0}</h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
            </div>
            <p className="text-xs text-green-600 mt-4 font-medium">
                {stats?.activeUsers} Active Accounts
            </p>
        </div>

        {/* Total Documents */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Documents</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats?.totalDocuments || 0}</h3>
                </div>
                <div className="p-3 bg-indigo-50 rounded-full">
                    <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">Across all categories</p>
        </div>

        {/* Pending Requests */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pending Requests</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats?.pendingRequests || 0}</h3>
                </div>
                <div className="p-3 bg-orange-50 rounded-full">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
            </div>
            <p className="text-xs text-orange-600 mt-4 font-medium">Action Required</p>
        </div>

        {/* System Status */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">System Status</p>
                    <h3 className="text-xl font-bold text-green-600 mt-2">Operational</h3>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">Server running smoothly</p>
        </div>
      </div>

      {/* Top Searches Section */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Top Search Trends</h3>
        </div>
        <div className="p-6">
            {stats?.topSearches && stats.topSearches.length > 0 ? (
                <div className="space-y-4">
                    {stats.topSearches.map((item, idx) => (
                        <div key={idx} className="flex items-center">
                            <span className="text-gray-400 w-6 font-bold text-sm">#{idx + 1}</span>
                            <div className="flex-1 ml-4">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700 capitalize">{item.term}</span>
                                    <span className="text-xs text-gray-500">{item.count} searches</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-indigo-600 h-2 rounded-full" 
                                        style={{ width: `${Math.min((item.count / stats.topSearches[0].count) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 italic">No search data available yet.</p>
            )}
        </div>
      </div>
    </div>
  );
}