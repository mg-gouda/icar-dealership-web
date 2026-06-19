'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { apiFetch } from '../lib/api';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001/api/v1';

interface Vehicle {
  id: string; make: string; model: string; year: number;
  price: number; mileage?: number; condition: string;
  bodyType?: string; color?: string;
  images?: { url: string; isPrimary?: boolean }[];
}

const fmt = (n: number) => n.toLocaleString('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 });

function FeaturedVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ data: Vehicle[] }>(`${API}/public/vehicles?limit=6&status=AVAILABLE`)
      .then((r) => setVehicles(r.data ?? []))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-2xl bg-gray-900 border border-white/5 h-64 animate-pulse" />
      ))}
    </div>
  );

  if (!vehicles.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {vehicles.map((v) => {
        const img = v.images?.find((i) => i.isPrimary)?.url ?? v.images?.[0]?.url;
        return (
          <Link key={v.id} href={`/vehicles/${v.id}`}
            className="group rounded-2xl border border-white/5 bg-gray-900 overflow-hidden hover:border-white/20 transition">
            <div className="h-44 bg-gray-800 overflow-hidden">
              {img
                ? <img src={img} alt={`${v.year} ${v.make} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                : <div className="w-full h-full flex items-center justify-center text-gray-700 text-4xl">🚗</div>
              }
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-0.5">{v.year} · {v.condition}</p>
              <p className="font-semibold text-white text-sm">{v.make} {v.model}</p>
              {v.mileage != null && <p className="text-xs text-gray-600 mt-0.5">{v.mileage.toLocaleString()} km</p>}
              <p className="text-blue-400 font-bold text-sm mt-2">{fmt(v.price)}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function QuickSearch() {
  const [q, setQ] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); window.location.href = `/vehicles?search=${encodeURIComponent(q)}`; }}
      className="flex gap-2 max-w-lg mx-auto">
      <input
        value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Search make, model, year…"
        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition" />
      <button type="submit"
        className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition">
        Search
      </button>
    </form>
  );
}

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
        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <p className="text-blue-400 text-sm font-medium uppercase tracking-widest mb-4">Egypt's Premium Dealership</p>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-5 leading-tight">
            Find Your<br />
            <span className="text-blue-400">Perfect Car</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Browse hundreds of new and certified pre-owned vehicles. Flexible financing with dealership
            installments or bank financing.
          </p>
          <QuickSearch />
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <Link href="/vehicles"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition text-sm">
              Browse Inventory
            </Link>
            <Link href="/financing"
              className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition text-sm">
              Financing Calculator
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

      {/* Featured Vehicles */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Available Now</h2>
          <Link href="/vehicles" className="text-xs text-blue-400 hover:text-blue-300 transition">View all →</Link>
        </div>
        <FeaturedVehicles />
      </section>

      {/* CTA cards */}
      <section className="max-w-5xl mx-auto px-6 pb-16 grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            title: 'Browse Inventory', desc: 'New arrivals, certified pre-owned, and special deals.',
            href: '/vehicles', cta: 'View All Cars →',
          },
          {
            title: 'Financing Options', desc: 'Cash, dealership installments, or bank financing with flexible terms.',
            href: '/financing', cta: 'Calculate Payments →',
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
