// Frontend/app/register/page.js - NEW FILE

import RegisterForm from '../../components/RegisterForm';

export default function RegisterPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Archivia CMS Registration
        </h1>
        <p className="mt-2 text-lg text-gray-500">
          Create an account to access secure features.
        </p>
      </header>

      <div className="max-w-xl mx-auto">
        <RegisterForm />
      </div>
    </main>
  );
}