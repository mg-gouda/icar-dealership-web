'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import { apiFetch } from '../../../lib/api';

interface Vehicle {
  id: string; make: string; model: string; year: number; condition: string;
  bodyType: string; color?: string; price: number; mileage?: number;
  fuelType?: string; status: string;
  images?: { url: string }[];
  location?: { name: string; city?: string };
}

const STORAGE_KEY = 'savedVehicleIds';

const fmt = (n: number) =>
  n.toLocaleString('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 });

export function getSavedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[]; }
  catch { return []; }
}

export function toggleSaved(id: string): boolean {
  const ids = getSavedIds();
  const next = ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next.includes(id);
}

export function isSaved(id: string): boolean {
  return getSavedIds().includes(id);
}

export default function SavedPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    const ids = getSavedIds();
    if (ids.length === 0) { setVehicles([]); setLoading(false); return; }
    setLoading(true);
    Promise.all(ids.map((id) => apiFetch<Vehicle>(`/public/vehicles/${id}`).catch(() => null)))
      .then((results) => {
        setVehicles(results.filter(Boolean) as Vehicle[]);
        setLoading(false);
      });
  }

  useEffect(() => { load(); }, []);

  function remove(id: string) {
    toggleSaved(id);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  }

  function clearAll() {
    localStorage.setItem(STORAGE_KEY, '[]');
    setVehicles([]);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Saved Vehicles</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {loading ? '…' : `${vehicles.length} saved`}
            </p>
          </div>
          {vehicles.length > 0 && !loading && (
            <button onClick={clearAll}
              className="text-xs text-gray-500 hover:text-red-400 transition border border-white/10 hover:border-red-400/30 px-3 py-1.5 rounded-lg">
              Clear All
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-gray-900 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="py-24 text-center">
            <div className="text-gray-700 text-5xl mb-4">♡</div>
            <p className="text-gray-500 mb-2">No saved vehicles.</p>
            <Link href="/vehicles" className="text-blue-400 hover:text-blue-300 text-sm transition">
              Browse our inventory →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vehicles.map((v) => {
              const img = v.images?.[0]?.url;
              return (
                <div key={v.id} className="rounded-2xl bg-gray-900 border border-white/5 overflow-hidden group relative">
                  <Link href={`/vehicles/${v.id}`}>
                    <div className="h-44 bg-gray-800 relative overflow-hidden">
                      {img ? (
                        <img src={img} alt={`${v.year} ${v.make} ${v.model}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1.293 1.293A1 1 0 005 17h1m8 0h5l-1.405-4.215A2 2 0 0016.68 11H14a1 1 0 00-1 1v4z"/>
                          </svg>
                        </div>
                      )}
                      <span className="absolute top-2 left-2 text-xs font-medium bg-gray-950/80 text-gray-300 px-2 py-0.5 rounded-full">
                        {v.condition}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-white font-semibold group-hover:text-blue-300 transition">
                        {v.year} {v.make} {v.model}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {[v.bodyType, v.fuelType, v.mileage ? `${v.mileage.toLocaleString()} km` : null]
                          .filter(Boolean).join(' · ')}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-blue-400 font-bold">{fmt(v.price)}</p>
                        <p className="text-gray-600 text-xs">{v.location?.city ?? v.location?.name ?? ''}</p>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => remove(v.id)}
                    title="Remove from saved"
                    className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-gray-950/80 text-red-400 hover:bg-red-500 hover:text-white transition text-sm">
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
