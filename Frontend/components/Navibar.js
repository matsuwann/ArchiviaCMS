'use client'; 

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Added useRouter
import { useAuth } from '../context/AuthContext'; 
import { useState } from 'react'; 

export default function Navbar() {
  const { user, logout, isAuthenticated, authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter(); // Initialize router
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
  
  // Checks if we are on /login or /register
  const isAuthPage = pathname === '/login' || pathname === '/register';
  
  // Logic for Sign In link (already existed)
  const shouldShowLoginLink = !isAuthenticated && pathname !== '/login' && pathname !== '/register';

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    router.push('/login'); // Redirect to login page
    router.refresh(); // Refresh the router to ensure all server components update
  };

  if (authLoading) {
    // Render a placeholder or nothing
  }

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
    <nav style={navStyle} className="shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          
          <Link 
            href="/" 
            style={brandStyle} 
            className="hover:opacity-80 flex items-center"
          >
            <div className="navbar-brand-icon"></div> 
            <span className="navbar-brand-text-from-css">Archivia</span>
          </Link>

          <ul className="flex space-x-6 items-center">
            
            {!isAuthPage && ( 
              <li>
                <Link href="/" style={linkStyle} className="hover:opacity-80">
                  Search & Browse
                </Link>
              </li>
            )}
            {isAuthenticated && (
              <li>
                <Link href="/upload" style={linkStyle} className="hover:opacity-80">
                  Upload Paper
                </Link>
              </li>
            )}
            {isAuthenticated ? (
              <li className="relative">
                <button
                  onClick={toggleDropdown}
                  className="py-1 px-3 bg-black bg-opacity-10 hover:bg-opacity-20 rounded-md font-semibold transition-colors flex items-center"
                  style={{ color: 'var(--navbar-text-color)' }}
                >
                  Welcome, {user?.firstName}!
                  <svg className={`ml-2 h-4 w-4 transform transition-transform ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div
                    style={{ color: 'var(--foreground)' }} 
                    className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg z-50 overflow-hidden"
                  >
                    {user?.is_admin && (
                      <div className="border-b border-gray-200">
                        <Link 
                          href="/admin/users" 
                          onClick={() => setIsDropdownOpen(false)} 
                          className="block px-4 py-2 text-sm font-bold text-indigo-700 hover:bg-slate-200"
                        >
                          Manage Users
                        </Link>
                         <Link 
                          href="/admin/documents" 
                          onClick={() => setIsDropdownOpen(false)} 
                          className="block px-4 py-2 text-sm font-bold text-indigo-700 hover:bg-slate-200"
                        >
                          Manage Documents
                        </Link>
                         <Link 
                          href="/admin/theme" 
                          onClick={() => setIsDropdownOpen(false)} 
                          className="block px-4 py-2 text-sm font-bold text-indigo-700 hover:bg-slate-200"
                         >
                          Manage Theme
                         </Link>
                      </div>
                    )}
                    
                    <Link 
                      href="/my-uploads" 
                      onClick={() => setIsDropdownOpen(false)} 
                      className="block px-4 py-2 hover:bg-slate-200"
                    >
                      My Submissions
                    </Link>

                    <Link 
                      href="/profile" 
                      onClick={() => setIsDropdownOpen(false)} 
                      className="block px-4 py-2 hover:bg-slate-200"
                    >
                      User Profile
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <>
                {/* Only show Sign In if NOT on login/register pages */}
                {shouldShowLoginLink && (
                  <li>
                    <Link href="/login" style={linkStyle} className="hover:opacity-80">
                      Sign In
                    </Link>
                  </li>
                )}
                
                {/* MODIFIED: Only show Create Account if NOT on login/register pages */}
                {!isAuthPage && (
                  <li>
                    <Link href="/register" style={linkStyle} className="hover:opacity-80">
                      Create Account
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}