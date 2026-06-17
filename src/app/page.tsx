import Link from 'next/link';
import Header from '../components/Header';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
          <p className="text-blue-400 text-sm font-medium uppercase tracking-widest mb-4">Egypt's Premium Dealership</p>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-5 leading-tight">
            Find Your<br />
            <span className="text-blue-400">Perfect Car</span>
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Browse hundreds of new and certified pre-owned vehicles. Flexible financing with dealership
            installments or bank financing.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/vehicles"
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition text-sm">
              Browse Inventory
            </Link>
            <Link href="/financing"
              className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition text-sm">
              Check Financing
            </Link>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-y border-white/5 bg-gray-900/50">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: '🚗', title: 'New & Used', desc: 'Wide selection of new, used, and certified vehicles' },
            { icon: '💳', title: 'Easy Financing', desc: 'Dealership installments or bank financing options' },
            { icon: '🔍', title: 'Test Drive', desc: 'Book a test drive at your convenience' },
            { icon: '📍', title: 'Cairo & Alexandria', desc: 'Multiple showrooms across Egypt' },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <div className="text-3xl mb-3">{f.icon}</div>
              <p className="text-sm font-semibold text-white mb-1">{f.title}</p>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA cards */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            title: 'Browse Inventory', desc: 'New arrivals, certified pre-owned, special deals.',
            href: '/vehicles', cta: 'View All Cars →',
          },
          {
            title: 'Financing Options', desc: 'Cash, dealership installments, or bank financing with flexible terms.',
            href: '/financing', cta: 'Get a Quote →',
          },
          {
            title: 'Book a Test Drive', desc: 'Schedule a visit at any of our showrooms across Egypt.',
            href: '/appointments', cta: 'Book Now →',
          },
        ].map((c) => (
          <Link key={c.href} href={c.href}
            className="group rounded-2xl border border-white/5 bg-gray-900 p-6 hover:border-white/20 transition">
            <h3 className="text-base font-semibold text-white mb-2 group-hover:text-blue-300 transition">{c.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{c.desc}</p>
            <span className="text-xs text-blue-400 font-medium">{c.cta}</span>
          </Link>
        ))}
      </section>

      <footer className="border-t border-white/5 bg-gray-900/50 px-6 py-8 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} iCar Dealership — Egypt · All rights reserved
      </footer>
    </div>
  );
}
