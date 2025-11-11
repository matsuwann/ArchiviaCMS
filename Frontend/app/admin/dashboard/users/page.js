// Placeholder for Feature 1 & 2
export default function UserManagementPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        User Management
      </h1>
      <p className="text-gray-700">
        This page will contain a table of all registered users.
        You will be able to view, edit roles, and delete users from here.
      </p>
      <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
        <p className="font-semibold">Coming Soon:</p>
        <ul className="list-disc list-inside">
          <li>Fetch and display all users from <code>/api/admin/users</code>.</li>
          <li>Add "Edit" and "Delete" buttons for each user.</li>
          <li>Create a modal for editing user details (First Name, Last Name, Email, isAdmin).</li>
        </ul>
      </div>
    </div>
  );
}