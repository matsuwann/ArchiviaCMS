import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navibar";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '../context/AuthContext'; 
import { Toaster } from 'react-hot-toast';

export const dynamic = 'force-dynamic'; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Archivia", 
  description: "A Capstone and Research Repository", 
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function getSystemSettings() {
  try {
    const res = await fetch(`${API_URL}/settings`, { 
      cache: 'no-store' 
    });
    
    if (!res.ok) {
      console.error("Failed to fetch settings, using defaults.");
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching settings:", error.message);
    return null;
  }
}

export default async function RootLayout({ children }) {
  
  const settings = await getSystemSettings();
  const GOOGLE_CLIENT_ID = "105198460940-ea151a6aa6ng04jmsbaja3i2djb0iuaj.apps.googleusercontent.com";

  const brandIconUrl = settings?.brandIconUrl || 'none';
  const bgImageUrl = settings?.backgroundImage || 'none';

  // Inject dynamic CSS variables into the document head
  const customStyles = `
    :root {
      /* Page */
      --background-color: ${settings?.backgroundColor || '#f8fafc'};
      --background-image: ${bgImageUrl !== 'none' ? `url('${bgImageUrl}')` : 'none'};
      --foreground: ${settings?.foregroundColor || '#1e293b'};
      
      /* Navbar */
      --navbar-bg-color: ${settings?.navbarBgColor || '#1e293b'};
      --navbar-text-color: ${settings?.navbarTextColor || '#ffffff'};
      --navbar-link-color: ${settings?.navbarLinkColor || '#f1f5f9'};
      
      /* Brand */
      --navbar-brand-font: ${settings?.navbarBrandFont || 'var(--font-geist-sans)'};
      --navbar-brand-size: ${settings?.navbarBrandSize || '1.5rem'};
      --navbar-brand-weight: ${settings?.navbarBrandWeight || '700'};
      --navbar-brand-text: '${settings?.navbarBrandText || 'Archivia'}';
      
      /* Brand Icon */
      --brand-icon-url: ${brandIconUrl !== 'none' ? `url('${brandIconUrl}')` : 'none'};
      --brand-icon-display: ${brandIconUrl === 'none' ? 'none' : 'inline-block'};
    }
  `;

  return (
    <html lang="en">
      <head><style>{customStyles}</style></head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
       
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}> 
          <AuthProvider> 
            {/* STYLED NOTIFICATIONS */}
            <Toaster 
              position="bottom-right" 
              toastOptions={{
                style: {
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  color: '#1e293b',
                  padding: '16px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                success: {
                  iconTheme: {
                    primary: '#4f46e5',
                    secondary: 'white',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: 'white',
                  },
                },
              }}
            />
            
            <Navbar />
            {children}
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}