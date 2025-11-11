'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext'; 
import { useState } from 'react'; 

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin, authLoading } = useAuth(); // <-- Get isAdmin
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
  
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/admin/login';
  const shouldShowLoginLink = !isAuthenticated && !isAuthPage;

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  if (authLoading) {
    // Render a minimal navbar or null during auth loading to avoid flashes
    return (
       <nav className="bg-slate-800 text-white shadow-md">
         <div className="container mx-auto px-4">
           <div className="flex justify-between items-center py-4">
              <Link href="/" className="text-2xl font-bold hover:text-slate-300">
                Archivia
              </Link>
              <div className="h-6 w-20 bg-slate-700 rounded animate-pulse"></div>
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

            {/* NEW: Admin Dashboard Link */}
            {isAdmin && (
              <li>
                <Link href="/admin/dashboard" className="py-1 px-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700">
                  Admin Dashboard
                </Link>
              </li>
            )}

            {isAuthenticated ? (
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
                {shouldShowLoginLink && (
                  <li>
                    <Link href="/login" className="hover:text-slate-300">
                      Login
                    </Link>
                  </li>
                )}
                
                {!isAuthPage && (
                  <li>
                    <Link href="/register" className="hover:text-slate-300">
                      Register
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