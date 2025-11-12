import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navibar";
import { AuthProvider } from '../context/AuthContext'; 

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

/**
 * (SERVER FUNCTION) Fetches settings from your backend API.
 * This runs on the server before the page is sent to the client.
 */
async function getSystemSettings() {
  try {
    const res = await fetch('http://localhost:3001/api/settings', { 
      cache: 'no-store' 
    });
    
    if (!res.ok) {
      console.error("Failed to fetch settings, using defaults.");
      return null;
    }
    
    // We expect the backend to send a simple object: { backgroundColor: '...', ... }
    const settings = await res.json();
    return settings; // This is now the object

  } catch (error) {
    console.error("Error fetching settings:", error.message);
    return null;
  }
}

/**
 * This is now an async Server Component
 */
export default async function RootLayout({ children }) {
  
  // 1. Fetch the colors from the backend
  const settings = await getSystemSettings();

  // 2. Create the dynamic style string to override CSS variables
  //    (This now correctly uses the object 'settings')
  const customStyles = `
    :root {
      --background: ${settings?.backgroundColor || '#ffffff'};
      --foreground: ${settings?.foregroundColor || '#171717'};
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
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}