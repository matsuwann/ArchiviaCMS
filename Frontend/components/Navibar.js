
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-slate-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold hover:text-slate-300">
            Archivia
          </Link>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:text-slate-300">
                Search & Browse
              </Link>
            </li>
            <li>
              <Link href="/upload" className="hover:text-slate-300">
                Upload Paper
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}