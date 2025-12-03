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

  if (loading) return <div className="flex h-screen items-center justify-center text-gray-400">Loading dashboard...</div>;

  const StatCard = ({ title, value, subtext, icon, colorClass, bgClass }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-4xl font-extrabold text-gray-900">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
                {icon}
            </div>
        </div>
        <p className={`text-sm mt-4 font-medium ${colorClass} bg-opacity-10 px-2 py-1 rounded-md inline-block`}>
            {subtext}
        </p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}! 👋</h2>
            <p className="text-indigo-200 text-lg">Here's what's happening in your repository today.</p>
        </div>
        {/* Decorative Circle */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5 pointer-events-none"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total Users" 
            value={stats?.totalUsers || 0} 
            subtext={`${stats?.activeUsers} Active Now`}
            colorClass="text-blue-600 bg-blue-50"
            bgClass="bg-blue-50"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>}
        />
        <StatCard 
            title="Documents" 
            value={stats?.totalDocuments || 0} 
            subtext="Indexed Papers"
            colorClass="text-indigo-600 bg-indigo-50"
            bgClass="bg-indigo-50"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>}
        />
        <StatCard 
            title="Pending Actions" 
            value={stats?.pendingRequests || 0} 
            subtext="Requires Attention"
            colorClass="text-orange-600 bg-orange-50"
            bgClass="bg-orange-50"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
        />
        <StatCard 
            title="System Status" 
            value="OK" 
            subtext="Operational"
            colorClass="text-green-600 bg-green-50"
            bgClass="bg-green-50"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
        />
      </div>

      {/* Top Searches Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Analytics: Top Searches</h3>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-500">Last 30 Days</span>
        </div>
        <div className="p-6">
            {stats?.topSearches && stats.topSearches.length > 0 ? (
                <div className="space-y-6">
                    {stats.topSearches.map((item, idx) => (
                        <div key={idx} className="flex items-center group">
                            <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold mr-4 ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                {idx + 1}
                            </span>
                            <div className="flex-1">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-bold text-gray-700 capitalize">{item.term}</span>
                                    <span className="text-xs text-gray-500 font-mono">{item.count} hits</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                    <div 
                                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out group-hover:bg-indigo-500" 
                                        style={{ width: `${Math.min((item.count / stats.topSearches[0].count) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-gray-400">
                    <p>No search data recorded yet.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}