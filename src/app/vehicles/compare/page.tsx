'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import { apiFetch } from '../../../lib/api';

interface Vehicle {
  id: string; make: string; model: string; year: number; condition: string;
  bodyType: string; color?: string; price: number; mileage?: number;
  fuelType?: string; transmission?: string; engineSize?: string; status: string;
  images?: { url: string }[];
  location?: { name: string; city?: string };
}

const fmt = (n: number) =>
  n.toLocaleString('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 });

const ROWS: { label: string; key: keyof Vehicle | 'mileageStr' }[] = [
  { label: 'Make', key: 'make' },
  { label: 'Model', key: 'model' },
  { label: 'Year', key: 'year' },
  { label: 'Body Type', key: 'bodyType' },
  { label: 'Transmission', key: 'transmission' },
  { label: 'Fuel Type', key: 'fuelType' },
  { label: 'Color', key: 'color' },
  { label: 'Engine', key: 'engineSize' },
  { label: 'Mileage', key: 'mileageStr' },
];

function getRowValue(v: Vehicle, key: string): string {
  if (key === 'mileageStr') return v.mileage ? `${v.mileage.toLocaleString()} km` : '—';
  const val = (v as unknown as Record<string, unknown>)[key];
  return val != null ? String(val) : '—';
}

export default function ComparePage() {
  const params = useSearchParams();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<(Vehicle | null)[]>([]);
  const [loading, setLoading] = useState(true);

  const ids = (params.get('ids') ?? '').split(',').filter(Boolean).slice(0, 3);

  const load = useCallback(async (idList: string[]) => {
    setLoading(true);
    const results = await Promise.all(
      idList.map((id) =>
        apiFetch<Vehicle>(`/public/vehicles/${id}`).catch(() => null)
      )
    );
    setVehicles(results);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    load(ids);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.get('ids')]);

  function remove(id: string) {
    const next = ids.filter((i) => i !== id);
    if (next.length === 0) { router.push('/vehicles'); return; }
    router.push(`/vehicles/compare?ids=${next.join(',')}`);
  }

  const filled = vehicles.filter(Boolean) as Vehicle[];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/vehicles" className="text-gray-500 hover:text-white text-sm transition">
            ← Back to Inventory
          </Link>
          <h1 className="text-xl font-bold text-white">Compare Vehicles</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-gray-900 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : ids.length === 0 ? (
          <div className="py-24 text-center text-gray-500">
            <p className="mb-4">No vehicles selected for comparison.</p>
            <Link href="/vehicles" className="text-blue-400 hover:text-blue-300">Browse Inventory →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              {/* Sticky header */}
              <thead>
                <tr>
                  <th className="sticky left-0 bg-gray-950 z-10 w-36 min-w-[9rem]" />
                  {vehicles.map((v, i) => (
                    <th key={i} className="p-0 align-top">
                      {v ? (
                        <div className="m-1 rounded-2xl bg-gray-900 border border-white/5 overflow-hidden">
                          <div className="h-40 bg-gray-800 relative">
                            {v.images?.[0]?.url ? (
                              <img src={v.images[0].url} alt={`${v.year} ${v.make} ${v.model}`}
                                className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-700">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                    d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                    d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1.293 1.293A1 1 0 005 17h1m8 0h5l-1.405-4.215A2 2 0 0016.68 11H14a1 1 0 00-1 1v4z"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <Link href={`/vehicles/${v.id}`}
                              className="text-sm font-semibold text-white hover:text-blue-300 transition line-clamp-1">
                              {v.year} {v.make} {v.model}
                            </Link>
                            <p className="text-blue-400 font-bold text-sm mt-1">{fmt(v.price)}</p>
                            <button
                              onClick={() => remove(v.id)}
                              className="mt-2 text-xs text-gray-500 hover:text-red-400 transition">
                              Remove ×
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="m-1 rounded-2xl bg-gray-900/50 border border-dashed border-white/10 h-[226px] flex items-center justify-center">
                          <span className="text-gray-600 text-xs">Failed to load</span>
                        </div>
                      )}
                    </th>
                  ))}
                  {/* Add vehicle placeholder columns */}
                  {Array.from({ length: Math.max(0, 3 - vehicles.length) }).map((_, i) => (
                    <th key={`add-${i}`} className="p-0 align-top">
                      <div className="m-1 rounded-2xl border border-dashed border-white/10 h-[226px] flex flex-col items-center justify-center gap-2">
                        <span className="text-gray-600 text-xs">Add Vehicle</span>
                        <Link href="/vehicles"
                          className="text-xs text-blue-400 hover:text-blue-300 transition">
                          Browse →
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Price row */}
              <tbody>
                <tr>
                  <td className="sticky left-0 bg-gray-950 z-10 px-3 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider border-t border-white/5">
                    Price
                  </td>
                  {vehicles.map((v, i) => (
                    <td key={i} className="px-4 py-3 text-sm font-bold text-blue-400 border-t border-white/5 text-center">
                      {v ? fmt(v.price) : '—'}
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - vehicles.length) }).map((_, i) => (
                    <td key={`ep-${i}`} className="border-t border-white/5" />
                  ))}
                </tr>

                {ROWS.map((row) => (
                  <tr key={row.key} className="group">
                    <td className="sticky left-0 bg-gray-950 z-10 px-3 py-3 text-xs text-gray-500 border-t border-white/5 group-hover:bg-gray-900/30 transition">
                      {row.label}
                    </td>
                    {vehicles.map((v, i) => (
                      <td key={i} className="px-4 py-3 text-sm text-white border-t border-white/5 text-center group-hover:bg-gray-900/30 transition">
                        {v ? getRowValue(v, row.key) : '—'}
                      </td>
                    ))}
                    {Array.from({ length: Math.max(0, 3 - vehicles.length) }).map((_, i) => (
                      <td key={`e-${i}`} className="border-t border-white/5 group-hover:bg-gray-900/30" />
                    ))}
                  </tr>
                ))}

                {/* CTA row */}
                <tr>
                  <td className="sticky left-0 bg-gray-950 z-10 border-t border-white/5" />
                  {vehicles.map((v, i) => (
                    <td key={i} className="px-4 py-4 border-t border-white/5 text-center">
                      {v && (
                        <Link href={`/vehicles/${v.id}`}
                          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition">
                          View Details
                        </Link>
                      )}
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - vehicles.length) }).map((_, i) => (
                    <td key={`ec-${i}`} className="border-t border-white/5" />
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
