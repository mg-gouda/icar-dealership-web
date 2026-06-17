'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import { apiFetch } from '../../../lib/api';

interface Vehicle {
  id: string; make: string; model: string; year: number; condition: string;
  bodyType: string; color?: string; price: number; cost?: number;
  mileage?: number; fuelType?: string; transmission?: string; engineSize?: string;
  doors?: number; seats?: number; vin: string;
  description?: string; status: string;
  features?: { name: string; category?: string }[];
  images?: { url: string; isPrimary: boolean; caption?: string }[];
  location?: { name: string; city?: string; phone?: string };
}

const fmt = (n: number) =>
  n.toLocaleString('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 });

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    apiFetch<Vehicle>(`/public/vehicles/${id}`)
      .then((v) => { setVehicle(v); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-500">Loading…</div>
    </div>
  );

  if (error || !vehicle) return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-red-400 mb-4">{error || 'Vehicle not found'}</p>
        <button onClick={() => router.back()} className="text-blue-400 hover:text-blue-300">← Back</button>
      </div>
    </div>
  );

  const images = vehicle.images ?? [];
  const sortedImages = [...images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

  const specs = [
    { label: 'Year', value: vehicle.year },
    { label: 'Condition', value: vehicle.condition },
    { label: 'Body Type', value: vehicle.bodyType },
    { label: 'Color', value: vehicle.color },
    { label: 'Fuel Type', value: vehicle.fuelType },
    { label: 'Transmission', value: vehicle.transmission },
    { label: 'Engine', value: vehicle.engineSize },
    { label: 'Mileage', value: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : undefined },
    { label: 'Doors', value: vehicle.doors },
    { label: 'Seats', value: vehicle.seats },
    { label: 'Stock #', value: vehicle.vin },
  ].filter((s) => s.value !== undefined && s.value !== null);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-white text-sm mb-5 transition">
          ← Back to inventory
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Images */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl overflow-hidden bg-gray-900 border border-white/5 h-80 lg:h-96 mb-3">
              {sortedImages.length > 0 ? (
                <img
                  src={sortedImages[activeImg]?.url}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-700">
                  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1.293 1.293A1 1 0 005 17h1m8 0h5l-1.405-4.215A2 2 0 0016.68 11H14a1 1 0 00-1 1v4z"/>
                  </svg>
                </div>
              )}
            </div>
            {sortedImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {sortedImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition ${i === activeImg ? 'border-blue-500' : 'border-white/5 hover:border-white/20'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Specs */}
            <div className="mt-6 rounded-2xl border border-white/5 bg-gray-900 p-5">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Specifications</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {specs.map((s) => (
                  <div key={s.label}>
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className="text-sm text-white font-medium mt-0.5">{String(s.value)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            {(vehicle.features?.length ?? 0) > 0 && (
              <div className="mt-4 rounded-2xl border border-white/5 bg-gray-900 p-5">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Features</h2>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features!.map((f) => (
                    <span key={f.name} className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-white/5">
                      {f.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {vehicle.description && (
              <div className="mt-4 rounded-2xl border border-white/5 bg-gray-900 p-5">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">About This Vehicle</h2>
                <p className="text-gray-300 text-sm leading-relaxed">{vehicle.description}</p>
              </div>
            )}
          </div>

          {/* Right: Pricing + CTAs */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-white/5 bg-gray-900 p-5 sticky top-20">
              <h1 className="text-xl font-bold text-white mb-1">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <p className="text-gray-500 text-sm mb-4">
                {[vehicle.bodyType, vehicle.color, vehicle.transmission].filter(Boolean).join(' · ')}
              </p>

              <p className="text-3xl font-bold text-blue-400 mb-1">{fmt(vehicle.price)}</p>
              <p className="text-gray-600 text-xs mb-5">Prices are indicative and subject to final confirmation</p>

              {vehicle.status === 'AVAILABLE' ? (
                <div className="space-y-3">
                  <Link href={`/financing?vehicleId=${vehicle.id}&price=${vehicle.price}`}
                    className="block w-full text-center py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition">
                    Inquire About Financing
                  </Link>
                  <Link href={`/appointments?vehicleId=${vehicle.id}`}
                    className="block w-full text-center py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition">
                    Book a Test Drive
                  </Link>
                  <a href={`tel:${vehicle.location?.phone ?? '+20-2-0000-0000'}`}
                    className="block w-full text-center py-3 text-gray-400 hover:text-white text-sm transition">
                    Call Us: {vehicle.location?.phone ?? '+20 2 0000 0000'}
                  </a>
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500 bg-gray-800 rounded-xl">
                  This vehicle is no longer available
                </p>
              )}

              <div className="mt-5 pt-4 border-t border-white/5">
                <p className="text-xs text-gray-500 mb-1">Location</p>
                <p className="text-sm text-white">{vehicle.location?.name ?? '—'}</p>
                {vehicle.location?.city && <p className="text-xs text-gray-500">{vehicle.location.city}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
