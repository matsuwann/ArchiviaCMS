'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import UploadForm from '../../components/UploadForm';

export default function UploadPage() {
  const router = useRouter();
  const { user, authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user?.is_super_admin) {
        router.push('/'); 
    }
  }, [user, authLoading, router]);

  const handleUploadSuccess = () => {
    router.push('/'); 
  };

  if (authLoading || user?.is_super_admin) return null; 

  return (
    <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-md">
            Contribute to the Archive
            </h1>
            <p className="text-indigo-100 mt-2 font-medium drop-shadow-sm">
            Share your research with the community.
            </p>
        </div>

        <UploadForm onUploadSuccess={handleUploadSuccess} />
      </div>
    </main>
  );
}