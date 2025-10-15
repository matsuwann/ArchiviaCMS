
'use client';

import { useRouter } from 'next/navigation';
import UploadForm from '../../components/UploadForm';

export default function UploadPage() {
  const router = useRouter();


  const handleUploadSuccess = () => {
    alert('File uploaded successfully! Redirecting to the homepage.');

    router.push('/'); 
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Upload New Paper
        </h1>
        <p className="mt-2 text-lg text-gray-500">
          Fill out the form below to add a new document to the repository.
        </p>
      </header>

      <div className="max-w-xl mx-auto">
        <UploadForm onUploadSuccess={handleUploadSuccess} />
      </div>
    </main>
  );
}