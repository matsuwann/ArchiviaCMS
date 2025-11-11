// Placeholder for Feature 6
export default function DesignSettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Design Settings
      </h1>
      <p className="text-gray-700">
        This page will allow you to customize the look and feel of the system.
      </p>
       <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
        <h3 className="font-semibold text-lg mb-2">How to Change Colors:</h3>
        <p>To change the dashboard colors, you can edit the CSS variables in <code>Frontend/app/globals.css</code> or the Tailwind classes directly in <code>Frontend/app/admin/dashboard/layout.js</code>.</p>
        <p className="mt-2">For example, to change the sidebar color, find the <code>bg-blue-700</code> class in the layout file and change it to another color like <code>bg-gray-800</code>.</p>
        
        <h3 className="font-semibold text-lg mt-4 mb-2">How to Add Icons:</h3>
        <p>You can add an icon library like <code>react-icons</code>:</p>
        <code className="block bg-gray-100 p-2 rounded text-sm my-2">npm install react-icons</code>
        <p>Then, in <code>Frontend/app/admin/dashboard/layout.js</code>, you could import and use them like this:</p>
        <code className="block bg-gray-100 p-2 rounded text-sm my-2">
          {`import { FaUsers, FaFileAlt } from 'react-icons/fa';`}
          <br />
          {`<AdminSidebarLink href="/admin/dashboard/users">`}
          <br />
          {`  <FaUsers className="inline-block mr-2" /> User Management`}
          <br />
          {`</AdminSidebarLink>`}
        </code>
      </div>
    </div>
  );
}