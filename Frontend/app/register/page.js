import RegisterForm from '../../components/RegisterForm';

export default function RegisterPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="w-full">
        <RegisterForm />
      </div>
    </main>
  );
}