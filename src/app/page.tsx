import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/5 bg-gray-900 px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold">iCar Dealership</span>
        <nav className="flex gap-6 text-sm text-gray-400">
          <Link href="/vehicles" className="hover:text-white transition">Vehicles</Link>
          <Link href="/financing" className="hover:text-white transition">Financing</Link>
          <Link href="/appointments" className="hover:text-white transition">Book a Test Drive</Link>
        </nav>
      </header>

      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold mb-4">Find Your Perfect Car</h1>
        <p className="text-gray-400 text-lg mb-10">
          Browse hundreds of new and used vehicles across our locations in Egypt.
        </p>
        <Link
          href="/vehicles"
          className="inline-block bg-white text-gray-900 font-medium px-8 py-3 rounded-xl hover:bg-gray-100 transition"
        >
          Browse Inventory
        </Link>
      </section>
    </main>
  );
}
