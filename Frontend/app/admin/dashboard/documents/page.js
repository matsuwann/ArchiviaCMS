// Placeholder for Feature 3
export default function DocumentManagementPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Document Management
      </h1>
      <p className="text-gray-700">
        This page will list all documents uploaded by all users.
        You will have administrative rights to view, edit, and delete any document.
      </p>
       <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
        <p className="font-semibold">Coming Soon:</p>
        <ul className="list-disc list-inside">
          <li>Fetch all documents from <code>/api/admin/documents</code>.</li>
          <li>Display documents in a table with uploader information.</li>
          <li>Add "Edit" and "Delete" buttons for each document.</li>
        </ul>
      </div>
    </div>
  );
}