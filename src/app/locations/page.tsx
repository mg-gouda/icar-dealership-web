'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { apiFetch } from '../../lib/api';

interface Location {
  id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  businessHours?: string;
}

const PLACEHOLDER_LOCATIONS: Location[] = [
  {
    id: 'placeholder-1',
    name: 'Cairo Branch',
    city: 'Cairo',
    address: 'Opening soon',
    businessHours: 'Coming soon',
  },
  {
    id: 'placeholder-2',
    name: 'Alexandria Branch',
    city: 'Alexandria',
    address: 'Opening soon',
    businessHours: 'Coming soon',
  },
];

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [usePlaceholder, setUsePlaceholder] = useState(false);

  useEffect(() => {
    apiFetch<Location[] | { data: Location[] }>('/public/locations')
      .then((res) => {
        const list = Array.isArray(res) ? res : (res as { data: Location[] }).data ?? [];
        if (list.length === 0) { setLocations(PLACEHOLDER_LOCATIONS); setUsePlaceholder(true); }
        else setLocations(list);
        setLoading(false);
      })
      .catch(() => {
        setLocations(PLACEHOLDER_LOCATIONS);
        setUsePlaceholder(true);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-blue-400 text-xs font-medium uppercase tracking-widest mb-2">Visit Us</p>
          <h1 className="text-3xl font-bold text-white mb-2">Our Branches</h1>
          <p className="text-gray-500 text-sm">Find us across Egypt</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[0, 1].map((i) => (
              <div key={i} className="h-56 rounded-2xl bg-gray-900 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {locations.map((loc) => {
              const isPlaceholder = usePlaceholder || loc.id.startsWith('placeholder');
              const mapsQuery = encodeURIComponent(`${loc.name} ${loc.city ?? ''}`);
              return (
                <div key={loc.id}
                  className="rounded-2xl border border-white/5 bg-gray-900 p-6 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-base font-bold text-white">{loc.name}</h2>
                      {loc.city && <p className="text-blue-400 text-xs mt-0.5">{loc.city}</p>}
                    </div>
                    {isPlaceholder && (
                      <span className="shrink-0 text-xs font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
                        Opening soon
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {loc.address && (
                      <div className="flex items-start gap-2 text-sm text-gray-400">
                        <svg className="w-4 h-4 mt-0.5 shrink-0 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{loc.address}</span>
                      </div>
                    )}
                    {loc.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <svg className="w-4 h-4 shrink-0 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href={`tel:${loc.phone}`} className="hover:text-white transition">{loc.phone}</a>
                      </div>
                    )}
                    {loc.businessHours && (
                      <div className="flex items-start gap-2 text-sm text-gray-400">
                        <svg className="w-4 h-4 mt-0.5 shrink-0 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <pre className="font-sans text-xs text-gray-500 whitespace-pre-wrap leading-relaxed">
                          {loc.businessHours}
                        </pre>
                      </div>
                    )}
                  </div>

                  {!isPlaceholder && (
                    <a
                      href={`https://maps.google.com/?q=${mapsQuery}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm rounded-xl transition self-start">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      Get Directions
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
