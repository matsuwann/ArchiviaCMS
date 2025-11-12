'use client';

import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { 
  getSettings, 
  adminUpdateSettings, 
  adminUploadIcon, 
  adminUploadBgImage, 
  adminRemoveBgImage, 
  adminUploadBrandIcon, 
  adminRemoveBrandIcon,
  adminResetSettings 
} from '../../../services/apiService';

export default function AdminThemeManagement() {
  const [settings, setSettings] = useState({
    backgroundColor: '#ffffff',
    foregroundColor: '#171717',
    navbarBrandText: 'Archivia',
    navbarBgColor: '#1e293b',
    navbarTextColor: '#ffffff',
    navbarLinkColor: '#ffffff',
    navbarBrandFont: 'var(--font-geist-sans)',
    navbarBrandSize: '1.5rem',
    navbarBrandWeight: '700',
    backgroundImage: 'none',
    brandIconUrl: 'none',
  });
  
  const [iconFile, setIconFile] = useState(null);
  const [bgImageFile, setBgImageFile] = useState(null);
  const [brandIconFile, setBrandIconFile] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function fetchSettings() {
    try {
      setLoading(true);
      const response = await getSettings();
      setSettings(prev => ({ ...prev, ...response.data }));
    } catch (err) {
      setMessage('Failed to load current settings.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSettingChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (key, newColor) => {
    setSettings(prev => ({ ...prev, [key]: newColor }));
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Saving settings...');
    try {
      await adminUpdateSettings(settings);
      setMessage('Settings updated! Reload page to see all changes.');
    } catch (err) {
      setMessage('Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!window.confirm("Are you sure you want to reset all theme settings to their default values? This action cannot be undone.")) {
      return;
    }
    setLoading(true);
    setMessage('Resetting settings...');
    try {
      const response = await adminResetSettings();
      setSettings(prev => ({ ...prev, ...response.data })); 
      setMessage('Settings reset to default! Reload page to see all changes.');
    } catch (err) {
      setMessage('Failed to reset settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleIconSubmit = async (e) => {
    e.preventDefault();
    if (!iconFile) return setMessage('Please select a favicon file.');
    setLoading(true);
    setMessage('Uploading favicon...');
    const formData = new FormData();
    formData.append('icon', iconFile);
    try {
      const response = await adminUploadIcon(formData);
      setMessage(response.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to upload favicon.');
    } finally {
      setLoading(false);
    }
  };

  const handleBgImageSubmit = async (e) => {
    e.preventDefault();
    if (!bgImageFile) return setMessage('Please select a background image file.');
    setLoading(true);
    setMessage('Uploading background image...');
    const formData = new FormData();
    formData.append('bg-image', bgImageFile);
    try {
      const response = await adminUploadBgImage(formData);
      setSettings(prev => ({ ...prev, backgroundImage: response.data.imageUrl }));
      setMessage(response.data.message + " Reload page to see changes.");
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setLoading(false);
    }
  };

  const handleBgImageRemove = async () => {
    if (!window.confirm("Are you sure you want to remove the background image?")) return;
    setLoading(true);
    setMessage('Removing background image...');
    try {
      await adminRemoveBgImage();
      setSettings(prev => ({ ...prev, backgroundImage: 'none' }));
      setMessage('Background image removed. Reload page to see changes.');
    } catch (err) {
      setMessage('Failed to remove image.');
    } finally {
      setLoading(false);
    }
  };

  const handleBrandIconSubmit = async (e) => {
    e.preventDefault();
    if (!brandIconFile) return setMessage('Please select a brand icon file.');
    setLoading(true);
    setMessage('Uploading brand icon...');
    const formData = new FormData();
    formData.append('brand-icon', brandIconFile);
    try {
      const response = await adminUploadBrandIcon(formData);
      setSettings(prev => ({ ...prev, brandIconUrl: response.data.iconUrl }));
      setMessage(response.data.message + " Reload page to see changes.");
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to upload icon.');
    } finally {
      setLoading(false);
    }
  };

  const handleBrandIconRemove = async () => {
    if (!window.confirm("Are you sure you want to remove the brand icon?")) return;
    setLoading(true);
    setMessage('Removing brand icon...');
    try {
      await adminRemoveBrandIcon();
      setSettings(prev => ({ ...prev, brandIconUrl: 'none' }));
      setMessage('Brand icon removed. Reload page to see changes.');
    } catch (err) {
      setMessage('Failed to remove icon.');
    } finally {
      setLoading(false);
    }
  };


  if (loading && !settings.backgroundColor) {
    return <p className="text-center">Loading settings...</p>;
  }

  return (
    <div className="space-y-8">
      {/* Settings Management Card */}
      <div className="p-8 bg-white rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-2">
          Manage System Theme
        </h2>
        
        {message && (
          <div className="p-3 bg-blue-100 text-blue-800 rounded-md mb-6 text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSettingsSubmit} className="space-y-6">
          
          <h3 className="text-xl font-semibold text-indigo-700">Page Colors</h3>
          <div className="flex flex-col sm:flex-row justify-around gap-8">
            <div className="flex-1 flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color (Fallback)
              </label>
              <HexColorPicker 
                color={settings.backgroundColor} 
                onChange={(newColor) => handleColorChange('backgroundColor', newColor)} 
              />
              <input type="text" value={settings.backgroundColor}
                onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                className="mt-3 w-32 text-center p-1 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="flex-1 flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foreground/Text Color
              </label>
              <HexColorPicker
                color={settings.foregroundColor}
                onChange={(newColor) => handleColorChange('foregroundColor', newColor)}
              />
              <input type="text" value={settings.foregroundColor}
                onChange={(e) => handleColorChange('foregroundColor', e.target.value)}
                className="mt-3 w-32 text-center p-1 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-indigo-700 pt-4 border-t">Navbar Settings</h3>
          <div>
            <label htmlFor="navbarBrandText" className="block text-sm font-medium text-gray-700">
              Navbar Brand Text
            </label>
            <input type="text" id="navbarBrandText" name="navbarBrandText"
              value={settings.navbarBrandText} onChange={handleSettingChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-around gap-8">
            <div className="flex-1 flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Navbar Background
              </label>
              <HexColorPicker
                color={settings.navbarBgColor}
                onChange={(newColor) => handleColorChange('navbarBgColor', newColor)}
              />
              <input type="text" value={settings.navbarBgColor}
                onChange={(e) => handleColorChange('navbarBgColor', e.target.value)}
                className="mt-3 w-32 text-center p-1 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="flex-1 flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Navbar Link Color
              </label>
              <HexColorPicker
                color={settings.navbarLinkColor}
                onChange={(newColor) => handleColorChange('navbarLinkColor', newColor)}
              />
              <input type="text" value={settings.navbarLinkColor}
                onChange={(e) => handleColorChange('navbarLinkColor', e.target.value)}
                className="mt-3 w-32 text-center p-1 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="navbarBrandFont" className="block text-sm font-medium text-gray-700">Brand Font</label>
              <select id="navbarBrandFont" name="navbarBrandFont"
                value={settings.navbarBrandFont} onChange={handleSettingChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="var(--font-geist-sans)">Geist Sans (Default)</option>
                <option value="var(--font-geist-mono)">Geist Mono</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
              </select>
            </div>
            <div>
              <label htmlFor="navbarBrandSize" className="block text-sm font-medium text-gray-700">Brand Font Size</label>
              <input type="text" id="navbarBrandSize" name="navbarBrandSize"
                value={settings.navbarBrandSize} onChange={handleSettingChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="e.g., 1.5rem"
              />
            </div>
            <div>
              <label htmlFor="navbarBrandWeight" className="block text-sm font-medium text-gray-700">Brand Font Weight</label>
              <input type="text" id="navbarBrandWeight" name="navbarBrandWeight"
                value={settings.navbarBrandWeight} onChange={handleSettingChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="e.g., 700"
              />
            </div>
          </div>
          
          <button
            type="submit" disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {loading ? 'Saving...' : 'Save All Text & Color Settings'}
          </button>
          

          <button
            type="button"
            onClick={handleResetToDefault}
            disabled={loading}
            className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 disabled:bg-red-400"
          >
            Reset All Settings to Default
          </button>

        </form>
      </div>

      <div className="p-8 bg-white rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-2">Manage Background Image</h2>
        <form onSubmit={handleBgImageSubmit} className="space-y-4">
          <input type="file" name="bg-image" accept="image/*"
            onChange={(e) => setBgImageFile(e.target.files[0])}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0"
          />
          <button type="submit" disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            Upload Background Image
          </button>
        </form>
        <button
          onClick={handleBgImageRemove} disabled={loading || settings.backgroundImage === 'none'}
          className="w-full mt-4 py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 disabled:bg-gray-400"
        >
          Remove Background Image
        </button>
      </div>

      <div className="p-8 bg-white rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-2">Manage Navbar Brand Icon</h2>
        <form onSubmit={handleBrandIconSubmit} className="space-y-4">
          <input type="file" name="brand-icon" accept="image/png, image/svg+xml"
            onChange={(e) => setBrandIconFile(e.target.files[0])}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0"
          />
          <button type="submit" disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            Upload Brand Icon
          </button>
        </form>
        <button
          onClick={handleBrandIconRemove} disabled={loading || settings.brandIconUrl === 'none'}
          className="w-full mt-4 py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 disabled:bg-gray-400"
        >
          Remove Brand Icon
        </button>
      </div>

      <div className="p-8 bg-white rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-2">Manage System Favicon</h2>
        <form onSubmit={handleIconSubmit} className="space-y-4">
          <input type="file" name="icon" accept="image/png,image/svg+xml,image/vnd.microsoft.icon,image/x-icon"
            onChange={(e) => setIconFile(e.target.files[0])}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0"
          />
          <button type="submit" disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {loading ? 'Uploading...' : 'Upload Favicon'}
          </button>
        </form>
      </div>

    </div>
  );
}