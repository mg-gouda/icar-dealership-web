'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import SearchableCombobox from '../../components/ui/SearchableCombobox';
import { apiFetch } from '../../lib/api';

interface Vehicle {
  id: string; make: string; model: string; year: number; condition: string;
  bodyType: string; color?: string; listPrice: number; mileage?: number;
  fuelType?: string; transmission?: string; status: string;
  images?: { url: string; isPrimary: boolean }[];
  location?: { name: string; city?: string };
}

const MAKES = ['Toyota', 'Hyundai', 'Kia', 'Nissan', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Honda', 'Ford', 'Jeep'].map((m) => ({ value: m, label: m }));
const BODY_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Van', 'Coupe', 'Wagon'].map((b) => ({ value: b, label: b }));
const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'year_desc', label: 'Year: Newest First' },
  { value: 'year_asc', label: 'Year: Oldest First' },
];

function fmt(n: number) {
  return n.toLocaleString('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 });
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [make, setMake] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [condition, setCondition] = useState('');
  const [sort, setSort] = useState('year_desc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams({
      status: 'AVAILABLE',
      limit: '48',
      ...(make && { make }),
      ...(bodyType && { bodyType }),
      ...(condition && { condition }),
      ...(search && { search }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
    });
    apiFetch<Vehicle[]>(`/vehicles?${qs}`)
      .then((d) => { setVehicles(d); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [search, make, bodyType, condition, minPrice, maxPrice]);

  const sorted = [...vehicles].sort((a, b) => {
    if (sort === 'price_asc') return a.listPrice - b.listPrice;
    if (sort === 'price_desc') return b.listPrice - a.listPrice;
    if (sort === 'year_asc') return a.year - b.year;
    return b.year - a.year;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Browse Inventory</h1>
          <p className="text-gray-500 text-sm">{loading ? '…' : `${sorted.length} vehicles available`}</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-2xl border border-white/5 p-4 mb-6 flex flex-wrap gap-3 items-end">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search make, model…"
            className="flex-1 min-w-[180px] px-3 py-1.5 bg-gray-800 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <SearchableCombobox options={MAKES} value={make} onChange={setMake}
            placeholder="Any Make" clearable clearLabel="Any Make" className="w-44" />
          <SearchableCombobox options={BODY_TYPES} value={bodyType} onChange={setBodyType}
            placeholder="Body Type" clearable clearLabel="Any Body Type" className="w-40" />
          <SearchableCombobox
            options={[{ value: 'NEW', label: 'New' }, { value: 'USED', label: 'Used' }, { value: 'CERTIFIED', label: 'Certified Pre-Owned' }]}
            value={condition} onChange={setCondition}
            placeholder="Condition" clearable clearLabel="Any Condition" className="w-40" />
          <div className="flex gap-2 items-center">
            <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min EGP" type="number"
              className="w-28 px-3 py-1.5 bg-gray-800 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
            <span className="text-gray-600 text-sm">–</span>
            <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max EGP" type="number"
              className="w-28 px-3 py-1.5 bg-gray-800 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
          </div>
          <SearchableCombobox options={SORT_OPTIONS} value={sort} onChange={setSort}
            placeholder="Sort by" className="w-48" />
        </div>

        {error && <p className="text-red-400 text-sm mb-6">{error}</p>}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-900 border border-white/5 h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sorted.map((v) => {
              const img = v.images?.find((i) => i.isPrimary)?.url ?? v.images?.[0]?.url;
              return (
                <Link key={v.id} href={`/vehicles/${v.id}`}
                  className="group rounded-2xl bg-gray-900 border border-white/5 hover:border-white/20 overflow-hidden transition">
                  {/* Image */}
                  <div className="h-44 bg-gray-800 relative overflow-hidden">
                    {img ? (
                      <img src={img} alt={`${v.year} ${v.make} ${v.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1.293 1.293A1 1 0 005 17h1m8 0h5l-1.405-4.215A2 2 0 0016.68 11H14a1 1 0 00-1 1v4z"/>
                        </svg>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 text-xs font-medium bg-gray-950/80 text-gray-300 px-2 py-0.5 rounded-full">
                      {v.condition}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <p className="text-white font-semibold group-hover:text-blue-300 transition">
                      {v.year} {v.make} {v.model}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {[v.bodyType, v.fuelType, v.mileage ? `${v.mileage.toLocaleString()} km` : null]
                        .filter(Boolean).join(' · ')}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-blue-400 font-bold">{fmt(v.listPrice)}</p>
                      <p className="text-gray-600 text-xs">{v.location?.city ?? v.location?.name ?? ''}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
            {sorted.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-600">
                No vehicles match your filters.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
