import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navibar";
import { AuthProvider } from '../context/AuthContext'; 
import { Toaster } from 'react-hot-toast';

// ADD THIS LINE HERE
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


// FIX: Use environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function getSystemSettings() {
  try {
    // Use the dynamic URL
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

  const brandIconUrl = settings?.brandIconUrl || 'none';
  const bgImageUrl = settings?.backgroundImage || 'none';

  const customStyles = `
    :root {
      /* Page */
      --background-color: ${settings?.backgroundColor || '#ffffff'};
      --background-image: ${bgImageUrl};
      --foreground: ${settings?.foregroundColor || '#171717'};
      
      /* Navbar */
      --navbar-bg-color: ${settings?.navbarBgColor || '#1e293b'};
      --navbar-text-color: ${settings?.navbarTextColor || '#ffffff'};
      --navbar-link-color: ${settings?.navbarLinkColor || '#ffffff'};
      
      /* Brand */
      --navbar-brand-font: ${settings?.navbarBrandFont || 'var(--font-geist-sans)'};
      --navbar-brand-size: ${settings?.navbarBrandSize || '1.5rem'};
      --navbar-brand-weight: ${settings?.navbarBrandWeight || '700'};
      --navbar-brand-text: '${settings?.navbarBrandText || 'Archivia'}';
      
      /* Brand Icon (Computed) */
      --brand-icon-url: ${brandIconUrl};
      --brand-icon-display: ${brandIconUrl === 'none' ? 'none' : 'inline-block'};
    }
  `;

  return (
    <html lang="en">
      <head>
        <style>{customStyles}</style>
      </head>
      
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider> 
        <Toaster position="bottom-right" />
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}