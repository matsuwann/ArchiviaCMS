'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext'; 
import { useState } from 'react'; // Import useState

export default function Navbar() {
  const { user, logout, isAuthenticated, authLoading } = useAuth();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown state
  
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const shouldShowLoginLink = !isAuthenticated && pathname !== '/login' && pathname !== '/register';

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // Close dropdown when logging out
  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
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
            
        
            {!isAuthPage && ( 
              <li>
                <Link href="/" className="hover:text-slate-300">
                  Search & Browse
                </Link>
              </li>
            )}
            {isAuthenticated && (
              <li>
                <Link href="/upload" className="hover:text-slate-300">
                  Upload Paper
                </Link>
              </li>
            )}
            {isAuthenticated ? (
              // Start of Dropdown implementation
              <li className="relative">
                <button
                  onClick={toggleDropdown}
                  className="py-1 px-3 bg-slate-700 hover:bg-slate-600 rounded-md font-semibold transition-colors flex items-center"
                >
                  Welcome, {user?.firstName}!
                  <svg className={`ml-2 h-4 w-4 transform transition-transform ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg z-50 overflow-hidden"
                  >
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
              // End of Dropdown implementation
            ) : (
              
              <>
           
                {shouldShowLoginLink && (
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