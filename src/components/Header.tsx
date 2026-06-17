import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-gray-950/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-lg font-bold text-white tracking-tight">
        iCar <span className="text-blue-400">Egypt</span>
      </Link>
      <nav className="flex gap-6 text-sm text-gray-400">
        <Link href="/vehicles" className="hover:text-white transition">Browse Cars</Link>
        <Link href="/financing" className="hover:text-white transition">Financing</Link>
        <Link href="/appointments" className="hover:text-white transition">Test Drive</Link>
      </nav>
    </header>
  );
}
