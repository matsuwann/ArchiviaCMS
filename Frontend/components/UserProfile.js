'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UserProfile() {
  const { user, isAuthenticated, authLoading } = useAuth();
  const router = useRouter();


  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="text-center p-6 bg-slate-100 rounded-lg shadow-md max-w-lg mx-auto">
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  
  return (
    <div className="p-8 bg-white rounded-xl shadow-2xl max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-2">
        Account Profile
      </h2>

      
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-indigo-700">Personal Information</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem label="First Name" value={user.firstName} />
          <InfoItem label="Last Name" value={user.lastName} />
        </div>
        
        <InfoItem label="Email Address" value={user.email} isFullWidth={true} />
        
        
        <div className="pt-4 border-t mt-6">
          <h3 className="text-xl font-semibold text-indigo-700 mb-4">Account Actions</h3>
          <p className="text-gray-600 mb-4">
            You can manage your account security and settings here.
          </p>
          <button
            
            onClick={() => alert("Change password feature coming soon!")}
            className="py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-colors"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}


const InfoItem = ({ label, value, isFullWidth = false }) => (
  <div className={isFullWidth ? 'sm:col-span-2' : ''}>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-lg font-medium text-gray-800 p-2 bg-slate-100 rounded-md border">
      {value}
    </p>
  </div>
);