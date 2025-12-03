'use client'; 

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; 
import { useAuth } from '../context/AuthContext'; 
import { useState, useRef, useEffect } from 'react'; 

export default function Navbar() {
  const { user, logout, isAuthenticated, authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter(); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
  const dropdownRef = useRef(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const shouldShowLoginLink = !isAuthenticated && pathname !== '/login' && pathname !== '/register';
  const isAdmin = user?.is_admin;
  const isSuperAdmin = user?.is_super_admin;

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    router.push('/login'); 
    router.refresh(); 
  };

  if (authLoading) return null;

  // Use dynamic values but add structure styling
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
    <nav style={navStyle} className="sticky top-0 z-50 shadow-lg transition-all duration-300">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          
          {/* Brand */}
          <Link href={isAdmin ? "/admin" : "/"} style={brandStyle} className="hover:opacity-90 flex items-center group transition-opacity">
            <div className="navbar-brand-icon group-hover:scale-105 transition-transform duration-200"></div> 
            <span className="navbar-brand-text-from-css tracking-tight">Archivia</span>
          </Link>

          {/* Navigation Links */}
          <ul className="flex space-x-8 items-center font-medium">
            {!isAuthPage && !isAdmin && ( 
              <li><Link href="/" style={linkStyle} className="hover:opacity-75 transition-opacity py-2 border-b-2 border-transparent hover:border-current">Search & Browse</Link></li>
            )}
            
            {isAuthenticated && !isAdmin && (
              <li><Link href="/upload" style={linkStyle} className="hover:opacity-75 transition-opacity py-2 border-b-2 border-transparent hover:border-current">Upload Paper</Link></li>
            )}

            {isAuthenticated ? (
              <li className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                  className="flex items-center space-x-2 py-1.5 px-4 bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/50" 
                  style={{ color: 'var(--navbar-text-color)' }}
                >
                  <span>{user?.firstName}</span>
                  {isSuperAdmin && <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider font-bold shadow-sm">SA</span>}
                  <svg className={`h-4 w-4 transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 py-2 z-50 transform origin-top-right animate-fade-in text-gray-800">
                    <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-400 uppercase font-semibold">Account Menu</div>
                    
                    {user?.is_admin && (
                      <div className="border-b border-gray-100 pb-1 mb-1">
                        <Link href="/admin/users" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">Manage Users</Link>
                        <Link href="/admin/documents" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">Manage Documents</Link>
                        
                        {isSuperAdmin && (
                          <>
                            <Link href="/admin/requests" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">Deletion Requests</Link>
                            <Link href="/admin/archive-requests" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">Archive Requests</Link>
                          </>
                        )}

                        <Link href="/admin/theme" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">Manage Theme</Link>
                      </div>
                    )}
                    
                    {!isAdmin && (
                        <Link href="/my-uploads" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Submissions</Link>
                    )}

                    <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">User Profile</Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium">Sign Out</button>
                    </div>
                  </div>
                )}
              </li>
            ) : (
              <div className="flex items-center space-x-4">
                {shouldShowLoginLink && <li><Link href="/login" style={linkStyle} className="hover:opacity-80 font-semibold">Sign In</Link></li>}
                {!isAuthPage && 
                  <li>
                    <Link href="/register" className="px-5 py-2 rounded-full bg-white text-gray-900 font-bold hover:bg-gray-100 transition-colors shadow-sm text-sm">
                      Get Started
                    </Link>
                  </li>
                }
              </div>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}