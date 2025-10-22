'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext'; 
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAuthenticated, authLoading } = useAuth();
  const pathname = usePathname();
  
  // State for dropdown menu visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Flag to hide "Search & Browse" on Login/Register pages
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // Helper function to close dropdown after an action (click a link or logout)
  const handleDropdownClick = () => {
      setIsDropdownOpen(false);
  };
  
  // Handle logout and close the dropdown
  const handleLogout = () => {
      logout();
      handleDropdownClick();
  };

  if (authLoading) {
    return (
      <nav className="bg-slate-800 text-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <span className="text-2xl font-bold">Archivia</span>
            <div className="text-sm">Loading user session...</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-slate-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold hover:text-slate-300">
            Archivia
          </Link>
          <ul className="flex space-x-6 items-center">
            
            {/* Show Search & Browse on all pages except Login/Register */}
            {!isAuthPage && ( 
              <li>
                <Link href="/" className="hover:text-slate-300">
                  Search & Browse
                </Link>
              </li>
            )}

            {/* Show Upload Paper only when authenticated */}
            {isAuthenticated && (
              <li>
                <Link href="/upload" className="hover:text-slate-300">
                  Upload Paper
                </Link>
              </li>
            )}
            

            {/* Conditional Rendering for AUTH STATE */}
            {isAuthenticated ? (
              // AUTHENTICATED: Display Username Dropdown Menu
              <li className="relative">
                {/* Username Button to Toggle Dropdown - NOW INCLUDES ICON */}
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1 px-3 py-1 bg-slate-700 rounded-md font-semibold hover:bg-slate-600 transition-colors focus:outline-none"
                  aria-expanded={isDropdownOpen}
                  aria-controls="user-menu-dropdown"
                >
                  <span>Welcome{user.username}!</span>
                  
                  {/* DROPDOWN ICON ADDED HERE */}
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isDropdownOpen ? 'transform rotate-180' : ''
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  {/* END DROPDOWN ICON */}
                </button>
                
                {/* Dropdown Menu Content */}
                {isDropdownOpen && (
                  <div 
                    id="user-menu-dropdown"
                    className="absolute right-0 mt-2 w-48 bg-slate-700 rounded-md shadow-xl z-10"
                  >
                    <ul className="py-1">
                      {/* Profile Link (remains in dropdown) */}
                      <li>
                        <Link 
                          href="/profile" 
                          onClick={handleDropdownClick}
                          className="block px-4 py-2 text-sm text-white hover:bg-slate-600"
                        >
                          Profile
                        </Link>
                      </li>
                      
                      {/* Logout Button (remains in dropdown) */}
                      <li>
                        <button 
                          onClick={handleLogout} 
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-600 border-t border-slate-600"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
            ) : (
              // UNAUTHENTICATED LINKS: Login Button
              <>
                {/* Condition ensures Login button is hidden on /login and /register pages */}
                {pathname !== '/login' && pathname !== '/register' && (
                  <li>
                    <Link href="/login" className="hover:text-slate-300">
                      Login
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