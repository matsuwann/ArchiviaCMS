'use client'; // <--- THIS IS THE FIX. IT MUST BE THE VERY FIRST LINE.

import { useState, useEffect } from 'react';
import { getSettings, adminUpdateSettings, adminUploadIcon } from '../../../services/apiService';

export default function AdminThemeManagement() {
  const [colors, setColors] = useState({
    backgroundColor: '',
    foregroundColor: '',
  });
  const [iconFile, setIconFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [colorMessage, setColorMessage] = useState('');
  const [iconMessage, setIconMessage] = useState('');

  // Fetch current colors when the page loads
  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const response = await getSettings();
        setColors({
          backgroundColor: response.data.backgroundColor || '#ffffff',
          foregroundColor: response.data.foregroundColor || '#171717',
        });
      } catch (err) {
        setColorMessage('Failed to load current settings.');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleColorChange = (e) => {
    const { name, value } = e.target;
    setColors(prev => ({ ...prev, [name]: value }));
  };

  const handleColorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setColorMessage('Saving colors...');
    try {
      await adminUpdateSettings(colors);
      setColorMessage('Colors updated successfully! Changes will appear on next page load.');
    } catch (err) {
      setColorMessage('Failed to save colors.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setIconFile(e.target.files[0]);
  };

  const handleIconSubmit = async (e) => {
    e.preventDefault();
    if (!iconFile) {
      setIconMessage('Please select a file to upload.');
      return;
    }
    setLoading(true);
    setIconMessage('Uploading icon...');
    
    const formData = new FormData();
    formData.append('icon', iconFile);

    try {
      const response = await adminUploadIcon(formData);
      setIconMessage(response.data.message || 'Icon uploaded! Hard refresh (Ctrl+Shift+R) to see changes.');
    } catch (err) {
      setIconMessage(err.response?.data?.message || 'Failed to upload icon.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !colors.backgroundColor) {
    return <p className="text-center">Loading settings...</p>;
  }

  return (
    <div className="space-y-8">
      {/* Color Management Card */}
      <div className="p-8 bg-white rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-2">
          Manage System Colors
        </h2>
        <form onSubmit={handleColorSubmit} className="space-y-4">
          <div>
            <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700">
              Background Color (Hex)
            </label>
            <input
              type="text"
              id="backgroundColor"
              name="backgroundColor"
              value={colors.backgroundColor}
              onChange={handleColorChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="#ffffff"
            />
          </div>
          <div>
            <label htmlFor="foregroundColor" className="block text-sm font-medium text-gray-700">
              Foreground/Text Color (Hex)
            </label>
            <input
              type="text"
              id="foregroundColor"
              name="foregroundColor"
              value={colors.foregroundColor}
              onChange={handleColorChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="#171717"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {loading ? 'Saving...' : 'Save Colors'}
          </button>
          {colorMessage && <p className="mt-2 text-sm text-center text-gray-600">{colorMessage}</p>}
        </form>
      </div>

      {/* Icon Management Card */}
      <div className="p-8 bg-white rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-2">
          Manage System Icon
        </h2>
        <form onSubmit={handleIconSubmit} className="space-y-4">
          <div>
            <label htmlFor="icon" className="block text-sm font-medium text-gray-700">
              Upload new favicon (.ico, .png, .svg)
            </label>
            <input
              type="file"
              id="icon"
              name="icon"
              onChange={handleFileChange}
              accept="image/png,image/svg+xml,image/vnd.microsoft.icon,image/x-icon"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {loading ? 'Uploading...' : 'Upload Icon'}
          </button>
          {iconMessage && <p className="mt-2 text-sm text-center text-gray-600">{iconMessage}</p>}
        </form>
      </div>
    </div>
  );
}