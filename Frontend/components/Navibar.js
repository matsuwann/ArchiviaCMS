'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext'; 

export default function Navbar() {
  const { user, logout, isAuthenticated, authLoading } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const shouldShowLoginLink = !isAuthenticated && pathname !== '/login' && pathname !== '/register';

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
              <>
                <li className="text-white font-semibold">
                  Welcome, {user.username}!
                </li>
                <li>
                  <button 
                    onClick={logout} 
                    className="py-1 px-3 bg-red-600 hover:bg-red-700 rounded-md font-semibold transition-colors"
                  >
                    Logout
                  </button>
                </li>
              </>
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