import LoginForm from '../../components/LoginForm';

export default function LoginPage() {
  return (
    // Use min-h-screen to ensure vertical centering against the global background
    <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in">
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg tracking-tight mb-2">
          Archivia CMS
        </h1>
        <p className="text-indigo-100 font-medium drop-shadow-md text-lg">
          Secure Academic Repository
        </p>
      </div>

      <LoginForm />
    </main>
  );
}