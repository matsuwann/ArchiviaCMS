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

  // Updated defaults for a cleaner look if no settings exist
  const customStyles = `
    :root {
      /* Page */
      --background-color: ${settings?.backgroundColor || '#f8fafc'};
      --background-image: ${bgImageUrl};
      --foreground: ${settings?.foregroundColor || '#0f172a'};
      
      /* Navbar */
      --navbar-bg-color: ${settings?.navbarBgColor || 'rgba(255, 255, 255, 0.85)'};
      --navbar-text-color: ${settings?.navbarTextColor || '#1e293b'};
      --navbar-link-color: ${settings?.navbarLinkColor || '#64748b'};
      
      /* Brand */
      --navbar-brand-font: ${settings?.navbarBrandFont || 'var(--font-geist-sans)'};
      --navbar-brand-size: ${settings?.navbarBrandSize || '1.5rem'};
      --navbar-brand-weight: ${settings?.navbarBrandWeight || '800'};
      --navbar-brand-text: '${settings?.navbarBrandText || 'Archivia'}';
      
      /* Brand Icon */
      --brand-icon-url: ${brandIconUrl};
      --brand-icon-display: ${brandIconUrl === 'none' ? 'none' : 'inline-block'};
    }
  `;

  return (
    <html lang="en">
      <head><style>{customStyles}</style></head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}> 
          <AuthProvider> 
            <Toaster position="bottom-right" toastOptions={{
              style: {
                background: '#334155',
                color: '#fff',
                borderRadius: '8px',
              },
            }}/>
            <Navbar />
            <div className="flex-grow flex flex-col">
              {children}
            </div>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}