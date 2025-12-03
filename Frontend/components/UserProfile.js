'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { updateUserProfile, changeUserPassword } from '../services/apiService';

export default function UserProfile() {
  // Destructure 'login' to update context state
  const { user, isAuthenticated, authLoading, login } = useAuth();
  const router = useRouter();

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '' });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Password Modal State
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMessage, setPwMessage] = useState({ type: '', text: '' });
  const [isPwSaving, setIsPwSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
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
      
      // Update auth context immediately if token is returned
      if (response.data.token && response.data.user) {
        login(response.data.user, response.data.token);
      }

      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      // No reload needed
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePwChange = (e) => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
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

  if (authLoading || !isAuthenticated) return <div className="text-center p-6">Loading...</div>;

  return (
    <div className="p-8 bg-white rounded-xl shadow-2xl max-w-3xl mx-auto relative">
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <h2 className="text-3xl font-bold text-gray-900">Account Profile</h2>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Edit Profile
          </button>
        )}
      </div>

      {profileMessage.text && (
        <div className={`mb-4 p-3 rounded ${profileMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {profileMessage.text}
        </div>
      )}

      <form onSubmit={handleProfileUpdate} className="space-y-6">
        <h3 className="text-xl font-semibold text-indigo-700">Personal Information</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isEditing ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  name="firstName"
                  value={editForm.firstName}
                  onChange={handleEditChange}
                  className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  name="lastName"
                  value={editForm.lastName}
                  onChange={handleEditChange}
                  className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <InfoItem label="First Name" value={user.firstName} />
              <InfoItem label="Last Name" value={user.lastName} />
            </>
          )}
        </div>
        
        <div>
          {isEditing ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                name="email"
                type="email"
                value={editForm.email}
                onChange={handleEditChange}
                className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          ) : (
            <InfoItem label="Email Address" value={user.email} isFullWidth={true} />
          )}
        </div>

        {isEditing && (
          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => { setIsEditing(false); setEditForm({ firstName: user.firstName, lastName: user.lastName, email: user.email }); }}
              className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        )}
      </form>

      <div className="pt-4 border-t mt-8">
        <h3 className="text-xl font-semibold text-indigo-700 mb-4">Account Security</h3>
        <p className="text-gray-600 mb-4">
            You can manage your account security and settings here.
        </p>
        <button
          onClick={() => setShowPwModal(true)}
          className="py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700"
        >
          Change Password
        </button>
      </div>

      {/* Change Password Modal */}
      {showPwModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Change Password</h3>
            {pwMessage.text && (
              <div className={`mb-4 p-2 text-sm rounded ${pwMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {pwMessage.text}
              </div>
            )}
            <form onSubmit={handlePwSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={pwForm.currentPassword}
                  onChange={handlePwChange}
                  className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={pwForm.newPassword}
                  onChange={handlePwChange}
                  className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">8+ chars, Uppercase, Lowercase, Number, Special char</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={pwForm.confirmPassword}
                  onChange={handlePwChange}
                  className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPwModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPwSaving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400"
                >
                  {isPwSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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