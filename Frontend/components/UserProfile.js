'use client';

import { useState } from 'react';
import EditUserModal from './EditUserModal';
import { updateUser } from '../services/apiService'; // Ensure this is imported
import { toast } from 'react-hot-toast';

export default function UserProfile({ user, onUpdateUser }) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!user) return null;

  const handleSave = async (id, data) => {
    try {
        const res = await updateUser(data); // Call the API
        if (onUpdateUser) onUpdateUser(res.data.user); // Update context
        toast.success('Profile updated!');
    } catch (err) {
        toast.error('Failed to update profile.');
        throw err; // Re-throw to let modal know it failed
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
            <div className="absolute bottom-0 left-8 transform translate-y-1/2">
                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                    <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-3xl font-bold text-slate-500 uppercase">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="pt-16 pb-8 px-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
                    <p className="text-gray-500 font-medium">{user.email}</p>
                    <div className="mt-2 flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${user.is_admin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                            {user.is_admin ? 'Administrator' : 'Standard User'}
                        </span>
                    </div>
                </div>
                
                <button
                    onClick={() => setIsEditOpen(true)}
                    className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition shadow-md flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    Edit Profile
                </button>
            </div>

            {/* Stats Grid */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-bold">Member Since</p>
                    <p className="text-lg font-semibold text-gray-800 mt-1">
                        {new Date().getFullYear()}
                    </p>
                </div>
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase font-bold">Account Status</p>
                    <p className="text-lg font-semibold text-green-600 mt-1 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span> Active
                    </p>
                </div>
            </div>
        </div>
      </div>

      {isEditOpen && (
        <EditUserModal 
            user={user} 
            isOpen={isEditOpen} 
            onClose={() => setIsEditOpen(false)} 
            onSave={handleSave} 
        />
      )}
    </div>
  );
}