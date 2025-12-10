'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { updateUserProfile, changeUserPassword } from '../services/apiService';

export default function UserProfile() {
  const { user, isAuthenticated, authLoading, login } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '' });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);

  const [showPwModal, setShowPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMessage, setPwMessage] = useState({ type: '', text: '' });
  const [isPwSaving, setIsPwSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (user) {
      setEditForm({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '' });
    }
  }, [isAuthenticated, authLoading, router, user]);

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setProfileMessage({ type: '', text: '' });
    try {
      const response = await updateUserProfile(editForm);
      if (response.data.token && response.data.user) {
        login(response.data.user, response.data.token);
      }
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setIsPwSaving(true);
    setPwMessage({ type: '', text: '' });
    try {
      await changeUserPassword(pwForm.currentPassword, pwForm.newPassword);
      setPwMessage({ type: 'success', text: 'Password changed successfully!' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowPwModal(false), 1500);
    } catch (err) {
      setPwMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setIsPwSaving(false);
    }
  };

  if (authLoading || !isAuthenticated) return <div className="text-center p-10 text-slate-400">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl font-bold uppercase shadow-lg shadow-slate-200">
            {user.firstName.charAt(0)}
        </div>
        <div className="flex-grow text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900">{user.firstName} {user.lastName}</h2>
            <p className="text-slate-500 font-medium">{user.email}</p>
            <div className="mt-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.is_admin ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                    {user.is_admin ? 'Administrator' : 'Standard User'}
                </span>
            </div>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition shadow-sm">
            Edit Details
          </button>
        )}
      </div>

      {profileMessage.text && (
        <div className={`p-4 rounded-xl font-medium border ${profileMessage.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
          {profileMessage.text}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Personal Info Form */}
        <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Personal Details</h3>
            <form onSubmit={handleProfileUpdate} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">First Name</label>
                        {isEditing ? (
                            <input name="firstName" value={editForm.firstName} onChange={handleEditChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" required />
                        ) : (
                            <p className="text-slate-800 font-semibold text-lg">{user.firstName}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Last Name</label>
                        {isEditing ? (
                            <input name="lastName" value={editForm.lastName} onChange={handleEditChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" required />
                        ) : (
                            <p className="text-slate-800 font-semibold text-lg">{user.lastName}</p>
                        )}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                    {isEditing ? (
                        <input name="email" type="email" value={editForm.email} onChange={handleEditChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" required />
                    ) : (
                        <p className="text-slate-800 font-semibold text-lg">{user.email}</p>
                    )}
                </div>

                {isEditing && (
                    <div className="flex gap-3 pt-4">
                        <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:bg-indigo-300">
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" onClick={() => { setIsEditing(false); setEditForm({ firstName: user.firstName, lastName: user.lastName, email: user.email }); }} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">
                            Cancel
                        </button>
                    </div>
                )}
            </form>
        </div>

        {/* Right Column: Security */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 h-fit">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Security</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">Ensure your account uses a strong password to protect your data.</p>
            <button onClick={() => setShowPwModal(true)} className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:bg-red-100 transition-colors">
                Change Password
            </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPwModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Update Password</h3>
            {pwMessage.text && (
              <div className={`mb-4 p-3 text-sm rounded-lg font-medium ${pwMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {pwMessage.text}
              </div>
            )}
            <form onSubmit={handlePwSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Current Password</label>
                <input type="password" name="currentPassword" value={pwForm.currentPassword} onChange={(e) => setPwForm({...pwForm, [e.target.name]: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">New Password</label>
                <input type="password" name="newPassword" value={pwForm.newPassword} onChange={(e) => setPwForm({...pwForm, [e.target.name]: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input type="password" name="confirmPassword" value={pwForm.confirmPassword} onChange={(e) => setPwForm({...pwForm, [e.target.name]: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowPwModal(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:text-slate-800 transition">Cancel</button>
                <button type="submit" disabled={isPwSaving} className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition disabled:bg-slate-400">
                  {isPwSaving ? 'Updating...' : 'Confirm Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}