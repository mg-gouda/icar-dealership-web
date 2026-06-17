'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import SearchableCombobox from '../../components/ui/SearchableCombobox';
import { apiFetch } from '../../lib/api';

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00',
].map((t) => ({ value: t, label: t }));

const APPT_TYPES = [
  { value: 'TEST_DRIVE', label: 'Test Drive', description: 'Drive the vehicle with a sales rep' },
  { value: 'SHOWROOM_VISIT', label: 'Showroom Visit', description: 'Browse vehicles at our showroom' },
  { value: 'VEHICLE_INSPECTION', label: 'Vehicle Inspection', description: 'Inspect a specific vehicle' },
];

function AppointmentForm() {
  const params = useSearchParams();
  const vehicleId = params.get('vehicleId') ?? '';

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    type: 'TEST_DRIVE',
    date: '',
    time: '10:00',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Min date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  function set(k: string, v: string) { setForm((p) => ({ ...p, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date) {
      setError('Name, phone, and date are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      // Create a lead first, then log appointment as activity
      const lead = await apiFetch<{ id: string }>('/public/leads', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
          source: 'WEBSITE_TEST_DRIVE',
          vehicleId: vehicleId || undefined,
          notes: `Appointment request: ${form.type} on ${form.date} at ${form.time}. ${form.notes}`,
        }),
      });
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Appointment Booked!</h2>
        <p className="text-gray-400 mb-2">
          We've received your request for <strong className="text-white">{form.date} at {form.time}</strong>.
        </p>
        <p className="text-gray-500 text-sm mb-8">A team member will confirm your appointment shortly.</p>
        <a href="/vehicles" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition">
          Continue Browsing
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-1">Book an Appointment</h1>
        <p className="text-gray-500 text-sm mb-8">Schedule a test drive or showroom visit.</p>

        <form onSubmit={submit} className="space-y-4">
          {/* Contact */}
          <div className="rounded-2xl border border-white/5 bg-gray-900 p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Details</p>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Full Name *</label>
              <input required value={form.name} onChange={(e) => set('name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Phone *</label>
              <input required value={form.phone} onChange={(e) => set('phone', e.target.value)}
                placeholder="01X XXXX XXXX"
                className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          {/* Appointment */}
          <div className="rounded-2xl border border-white/5 bg-gray-900 p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Appointment Details</p>
            <SearchableCombobox
              label="Type"
              options={APPT_TYPES}
              value={form.type}
              onChange={(v) => set('type', v)}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date *</label>
                <input required type="date" value={form.date} min={minDate}
                  onChange={(e) => set('date', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <SearchableCombobox
                label="Time"
                options={TIME_SLOTS}
                value={form.time}
                onChange={(v) => set('time', v)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Notes</label>
              <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
                rows={2} placeholder="Specific vehicle interest, questions…"
                className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none" />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={submitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition">
            {submitting ? 'Booking…' : 'Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950"><Header /></div>}>
      <AppointmentForm />
    </Suspense>
  );
}
