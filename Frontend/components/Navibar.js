'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext'; 

export default function Navbar() {
  const { user, logout, isAuthenticated, authLoading } = useAuth();
  const pathname = usePathname();
  
  // Flag to hide "Search & Browse" on Login/Register pages
  const isAuthPage = pathname === '/login' || pathname === '/register';
  
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
              // AUTHENTICATED LINKS: Welcome Message/Profile Link and Logout Button
              <>
                {/* MODIFIED: The Welcome message is now a clickable Link to the Profile page */}
                <li>
                  <Link 
                    href="/profile" 
                    className="text-white font-semibold hover:text-slate-300 transition-colors"
                  >
                    Welcome, {user.username}!
                  </Link>
                </li>
                {/* END MODIFIED */}
                
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