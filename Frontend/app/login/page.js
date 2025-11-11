

import LoginForm from '../../components/LoginForm';

export default function LoginPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Archivia CMS Login
        </h1>
        <p className="mt-2 text-lg text-gray-500">
          Sign in to access secure features.
        </p>
      </header>

      <div className="max-w-xl mx-auto">
        <LoginForm />
      </div>
    </main>
  );
}