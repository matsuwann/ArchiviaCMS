'use client';

import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { getSettings, adminUpdateSettings, adminUploadIcon, adminUploadBgImage, adminRemoveBgImage, adminUploadBrandIcon, adminRemoveBrandIcon, adminResetSettings } from '../../../services/apiService';

export default function AdminThemeManagement() {
  const [settings, setSettings] = useState({
    backgroundColor: '#f8fafc', foregroundColor: '#0f172a', navbarBrandText: 'Archivia',
    navbarBgColor: '#ffffff', navbarTextColor: '#334155', navbarLinkColor: '#64748b',
    navbarBrandFont: 'var(--font-geist-sans)', navbarBrandSize: '1.5rem', navbarBrandWeight: '800',
    backgroundImage: 'none', brandIconUrl: 'none',
  });
  
  const [iconFile, setIconFile] = useState(null);
  const [bgImageFile, setBgImageFile] = useState(null);
  const [brandIconFile, setBrandIconFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getSettings().then(res => { setSettings(prev => ({ ...prev, ...res.data })); setLoading(false); })
                 .catch(() => { setMessage('Failed to load settings.'); setLoading(false); });
  }, []);

  const handleSettingChange = (e) => setSettings({ ...settings, [e.target.name]: e.target.value });
  const handleColorChange = (key, val) => setSettings({ ...settings, [key]: val });

  const submitSettings = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await adminUpdateSettings(settings); setMessage('Global theme updated.'); } 
    catch { setMessage('Update failed.'); } finally { setLoading(false); }
  };

  const resetSettings = async () => {
    if (!confirm("Reset to default theme?")) return;
    setLoading(true);
    try { const res = await adminResetSettings(); setSettings(prev => ({ ...prev, ...res.data })); setMessage('Reset successful.'); } 
    catch { setMessage('Reset failed.'); } finally { setLoading(false); }
  };

  const uploadFile = async (e, file, apiFunc, stateKey) => {
    e.preventDefault(); if(!file) return setMessage('No file selected.');
    setLoading(true);
    const fd = new FormData(); fd.append('file', file); // Generic key 'file' or specific based on API
    // Note: The specific API calls use specific keys like 'icon', 'bg-image', etc. 
    // Adapting below to match original logic but cleaned up.
  };

  // Re-implemented specific handlers for clarity in UI
  const handleIconSubmit = async (e) => {
      e.preventDefault(); if(!iconFile) return; setLoading(true);
      const fd = new FormData(); fd.append('icon', iconFile);
      try { await adminUploadIcon(fd); setMessage("Favicon updated."); } catch(e){ setMessage("Failed."); } finally { setLoading(false); }
  };

  const handleBgSubmit = async (e) => {
      e.preventDefault(); if(!bgImageFile) return; setLoading(true);
      const fd = new FormData(); fd.append('bg-image', bgImageFile);
      try { const r = await adminUploadBgImage(fd); setSettings({...settings, backgroundImage: r.data.imageUrl}); setMessage("Background updated."); } catch(e){ setMessage("Failed."); } finally { setLoading(false); }
  };

  const handleBrandSubmit = async (e) => {
      e.preventDefault(); if(!brandIconFile) return; setLoading(true);
      const fd = new FormData(); fd.append('brand-icon', brandIconFile);
      try { const r = await adminUploadBrandIcon(fd); setSettings({...settings, brandIconUrl: r.data.iconUrl}); setMessage("Brand icon updated."); } catch(e){ setMessage("Failed."); } finally { setLoading(false); }
  };

  if (loading && !settings.navbarBrandText) return <div className="p-10 text-center">Loading theme...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Theme Customization</h2>
            <p className="text-slate-500 mt-1">Branding and appearance settings</p>
        </div>
        <button onClick={resetSettings} className="text-sm font-bold text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition">Reset Defaults</button>
      </div>

      {message && <div className="p-4 bg-indigo-50 text-indigo-800 rounded-xl text-center font-medium">{message}</div>}

      <form onSubmit={submitSettings} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Colors Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Color Palette</h3>
            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Navbar Background</label>
                    <div className="flex gap-4 items-center">
                        <HexColorPicker color={settings.navbarBgColor} onChange={(c) => handleColorChange('navbarBgColor', c)} style={{ width: '100%', height: '150px' }} />
                        <div className="w-12 h-12 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: settings.navbarBgColor }}></div>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Text Color</label>
                    <div className="flex gap-4 items-center">
                        <HexColorPicker color={settings.navbarTextColor} onChange={(c) => handleColorChange('navbarTextColor', c)} style={{ width: '100%', height: '150px' }} />
                        <div className="w-12 h-12 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: settings.navbarTextColor }}></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Typography & Brand Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-6">Typography & Brand</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Brand Name</label>
                        <input name="navbarBrandText" value={settings.navbarBrandText} onChange={handleSettingChange} className="w-full p-2 border border-slate-200 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Font Family</label>
                        <select name="navbarBrandFont" value={settings.navbarBrandFont} onChange={handleSettingChange} className="w-full p-2 border border-slate-200 rounded-lg bg-white">
                            <option value="var(--font-geist-sans)">Geist Sans</option>
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="Georgia, serif">Georgia</option>
                        </select>
                    </div>
                </div>
            </div>
            <button type="submit" disabled={loading} className="mt-8 w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition shadow-lg">Save Visual Settings</button>
        </div>
      </form>

      {/* Asset Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
            { title: "Background Image", submit: handleBgSubmit, fileState: setBgImageFile },
            { title: "Brand Logo", submit: handleBrandSubmit, fileState: setBrandIconFile },
            { title: "Favicon", submit: handleIconSubmit, fileState: setIconFile }
        ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-4">{item.title}</h3>
                <form onSubmit={item.submit} className="space-y-4">
                    <input type="file" onChange={(e) => item.fileState(e.target.files[0])} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                    <button type="submit" className="w-full py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition text-xs">Upload</button>
                </form>
            </div>
        ))}
      </div>
    </div>
  );
}