import UserProfile from '../../components/UserProfile';

export default function ProfilePage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Your Archivia Profile
        </h1>
        <p className="mt-2 text-lg text-gray-500">
          View and manage your account details.
        </p>
      </header>

      <div className="max-w-4xl mx-auto">
        <UserProfile />
      </div>
    </main>
  );
}