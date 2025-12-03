import UserProfile from '../../components/UserProfile';

export default function ProfilePage() {
  return (
    <main className="min-h-[calc(100vh-80px)] p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl space-y-6">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
            Your Archivia Profile
          </h1>
          <p className="mt-2 text-indigo-100 font-medium drop-shadow-sm">
            Manage your account settings and preferences.
          </p>
        </header>

        <UserProfile />
      </div>
    </main>
  );
}