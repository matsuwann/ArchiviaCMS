'use client'; 

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; 
import { useAuth } from '../context/AuthContext'; 
import { useState } from 'react'; 

export default function Navbar() {
  const { user, logout, isAuthenticated, authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter(); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
  
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const shouldShowLoginLink = !isAuthenticated && pathname !== '/login' && pathname !== '/register';
  
  const isAdmin = user?.is_admin;
  const isSuperAdmin = user?.is_super_admin;

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    router.push('/login'); 
    router.refresh(); 
  };

  if (authLoading) return null;

  const navStyle = {
    backgroundColor: 'var(--navbar-bg-color)',
    color: 'var(--navbar-text-color)', 
  };

  const brandStyle = {
    fontFamily: 'var(--navbar-brand-font)',
    fontSize: 'var(--navbar-brand-size)',
    fontWeight: 'var(--navbar-brand-weight)',
    color: 'var(--navbar-text-color)', 
  };
  
  const linkStyle = {
    color: 'var(--navbar-link-color)', 
  };

  return (
    <nav style={navStyle} className="sticky top-0 z-50 backdrop-blur-md border-b border-gray-200/50 transition-all duration-300">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          
          <Link href={isAdmin ? "/admin" : "/"} style={brandStyle} className="hover:opacity-80 flex items-center transition-opacity">
            <div className="navbar-brand-icon"></div> 
            <span className="navbar-brand-text-from-css">Archivia</span>
          </Link>

          <ul className="flex space-x-8 items-center font-medium text-sm">
            {/* HIDE SEARCH FOR ADMINS */}
            {!isAuthPage && !isAdmin && ( 
              <li><Link href="/" style={linkStyle} className="hover:text-indigo-600 transition-colors">Library</Link></li>
            )}
            
            {/* HIDE UPLOAD FOR ADMINS */}
            {isAuthenticated && !isAdmin && (
              <li><Link href="/upload" style={linkStyle} className="hover:text-indigo-600 transition-colors">Upload</Link></li>
            )}

            {isAuthenticated ? (
              <li className="relative">
                <button onClick={toggleDropdown} className="group flex items-center gap-2 py-1.5 px-3 rounded-full hover:bg-black/5 transition-colors" style={{ color: 'var(--navbar-text-color)' }}>
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase text-xs border border-indigo-200">
                    {user?.firstName?.charAt(0)}
                  </div>
                  <span className="font-semibold">{user?.firstName}</span>
                  
                  {/* ADMIN BADGES */}
                  {isSuperAdmin ? (
                    <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">SA</span>
                  ) : isAdmin ? (
                    <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">Admin</span>
                  ) : null}

                  <svg className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-fade-in origin-top-right ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">My Account</p>
                    </div>
                    
                    {user?.is_admin && (
                      <div className="border-b border-gray-100 pb-1 mb-1">
                        <Link href="/admin/users" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 font-medium">Manage Users</Link>
                        <Link href="/admin/documents" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 font-medium">Manage Documents</Link>
                        
                        {isSuperAdmin && (
                            <Link href="/admin/requests" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 font-medium">Deletion Requests</Link>
                        )}
                        
                        {isSuperAdmin && (
                            <Link href="/admin/archive-requests" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 font-medium">Archive Requests</Link>
                        )}

                        <Link href="/admin/theme" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 font-medium">Manage Theme</Link>
                      </div>
                    )}
                    
                    {!isAdmin && (
                        <Link href="/my-uploads" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600">My Submissions</Link>
                    )}

                    <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600">Profile Settings</Link>
                    
                    <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">Sign Out</button>
                    </div>
                  </div>
                )}
              </li>
            ) : (
              <div className="flex items-center space-x-3">
                {shouldShowLoginLink && <Link href="/login" style={{ color: 'var(--navbar-link-color)' }} className="px-4 py-2 hover:text-indigo-600 transition-colors font-medium">Sign In</Link>}
                {!isAuthPage && <Link href="/register" className="px-5 py-2.5 bg-indigo-600 text-white rounded-full font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all transform hover:-translate-y-0.5">Get Started</Link>}
              </div>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}