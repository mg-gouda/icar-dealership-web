'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import SearchableCombobox from '../../components/ui/SearchableCombobox';
import { apiFetch } from '../../lib/api';

const PURCHASE_METHODS = [
  { value: 'CASH', label: 'Cash Purchase', description: 'Full payment upfront' },
  { value: 'DEALERSHIP_INSTALLMENT', label: 'Dealership Installment', description: 'Finance directly through us' },
  { value: 'BANK_FINANCING', label: 'Bank Financing', description: 'Finance through your preferred bank' },
];

const BANKS = [
  'CIB', 'National Bank of Egypt', 'Banque Misr', 'QNB Alahli', 'HSBC Egypt',
  'Arab African International Bank', 'Abu Dhabi Islamic Bank', 'Banque du Caire',
  'Alex Bank', 'Crédit Agricole Egypt',
].map((b) => ({ value: b, label: b }));

const INCOME_RANGES = [
  { value: '0-10000', label: 'Up to 10,000 EGP / month' },
  { value: '10000-25000', label: '10,000 – 25,000 EGP / month' },
  { value: '25000-50000', label: '25,000 – 50,000 EGP / month' },
  { value: '50000-100000', label: '50,000 – 100,000 EGP / month' },
  { value: '100000+', label: 'Over 100,000 EGP / month' },
];

function FinancingForm() {
  const params = useSearchParams();
  const vehicleId = params.get('vehicleId') ?? '';
  const vehiclePrice = Number(params.get('price') ?? 0);

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    purchaseMethod: 'DEALERSHIP_INSTALLMENT',
    preferredBank: '',
    downPayment: vehiclePrice > 0 ? Math.round(vehiclePrice * 0.2).toString() : '',
    incomeRange: '',
    employmentType: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Simple monthly estimate
  const downNum = Number(form.downPayment) || 0;
  const financed = vehiclePrice - downNum;
  const monthlyEst = form.purchaseMethod === 'DEALERSHIP_INSTALLMENT' && financed > 0
    ? Math.round((financed * 1.22) / 48) // 22% annual interest, 48 months approx
    : 0;

  function set(k: string, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone) { setError('Name and phone are required.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await apiFetch('/public/leads', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
          source: 'WEBSITE_FINANCING',
          vehicleId: vehicleId || undefined,
          notes: [
            `Purchase Method: ${form.purchaseMethod}`,
            form.preferredBank ? `Bank: ${form.preferredBank}` : '',
            form.downPayment ? `Down Payment: ${Number(form.downPayment).toLocaleString()} EGP` : '',
            form.incomeRange ? `Income: ${form.incomeRange}` : '',
            form.employmentType ? `Employment: ${form.employmentType}` : '',
            form.notes,
          ].filter(Boolean).join('\n'),
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
        <h2 className="text-2xl font-bold text-white mb-3">Inquiry Received!</h2>
        <p className="text-gray-400 mb-8">Our financing team will contact you within 24 hours to discuss your options.</p>
        <a href="/vehicles" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition">
          Browse More Vehicles
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-1">Financing Inquiry</h1>
        <p className="text-gray-500 text-sm mb-8">Fill in your details and we'll get back to you with tailored options.</p>

        {vehiclePrice > 0 && (
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 mb-6 flex justify-between items-center">
            <div>
              <p className="text-xs text-blue-400 font-medium uppercase tracking-wide">Vehicle Price</p>
              <p className="text-xl font-bold text-white mt-0.5">
                {vehiclePrice.toLocaleString('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 })}
              </p>
            </div>
            {monthlyEst > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Est. monthly (48m)</p>
                <p className="text-lg font-bold text-blue-400">
                  {monthlyEst.toLocaleString('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 })}
                </p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {/* Contact */}
          <div className="rounded-2xl border border-white/5 bg-gray-900 p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          {/* Financing */}
          <div className="rounded-2xl border border-white/5 bg-gray-900 p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Financing Preferences</p>
            <SearchableCombobox
              label="Purchase Method"
              options={PURCHASE_METHODS}
              value={form.purchaseMethod}
              onChange={(v) => set('purchaseMethod', v)}
            />
            {form.purchaseMethod === 'BANK_FINANCING' && (
              <SearchableCombobox
                label="Preferred Bank"
                options={BANKS}
                value={form.preferredBank}
                onChange={(v) => set('preferredBank', v)}
                placeholder="Select bank…"
                clearable
              />
            )}
            {(form.purchaseMethod === 'DEALERSHIP_INSTALLMENT' || form.purchaseMethod === 'BANK_FINANCING') && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Down Payment (EGP)</label>
                <input type="number" value={form.downPayment} onChange={(e) => set('downPayment', e.target.value)}
                  placeholder="e.g. 100000"
                  className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
              </div>
            )}
            <SearchableCombobox
              label="Monthly Income Range"
              options={INCOME_RANGES}
              value={form.incomeRange}
              onChange={(v) => set('incomeRange', v)}
              placeholder="Select range…"
              clearable
            />
            <SearchableCombobox
              label="Employment Type"
              options={[
                { value: 'EMPLOYED', label: 'Employed (private sector)' },
                { value: 'GOVERNMENT', label: 'Government employee' },
                { value: 'SELF_EMPLOYED', label: 'Self-employed / Business owner' },
                { value: 'RETIRED', label: 'Retired' },
              ]}
              value={form.employmentType}
              onChange={(v) => set('employmentType', v)}
              placeholder="Select type…"
              clearable
            />
          </div>

          {/* Notes */}
          <div className="rounded-2xl border border-white/5 bg-gray-900 p-5">
            <label className="block text-xs text-gray-500 mb-2">Additional Notes</label>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
              rows={3} placeholder="Any specific requirements or questions…"
              className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none" />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={submitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition">
            {submitting ? 'Submitting…' : 'Submit Inquiry'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function FinancingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950"><Header /></div>}>
      <FinancingForm />
    </Suspense>
  );
}
