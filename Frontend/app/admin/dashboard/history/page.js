// Placeholder for Feature 5
export default function UploadHistoryPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Document Upload History
      </h1>
      <p className="text-gray-700">
        This page will show a chronological log of all document uploads,
        including who uploaded them and when.
      </p>
      <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
        <p className="font-semibold">Note:</p>
        <p>This page will likely use the same data as the "Document Management" page, but may be sorted differently or show different columns (e.g., focus on `created_at` and `uploader_email`).</p>
      </div>
    </div>
  );
}