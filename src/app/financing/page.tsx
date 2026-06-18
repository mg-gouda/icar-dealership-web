'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import SearchableCombobox from '../../components/ui/SearchableCombobox';
import { apiFetch } from '../../lib/api';

// ─── Calculator ────────────────────────────────────────────────────────────

const DURATIONS = [12, 24, 36, 48, 60];

const fmt = (n: number) =>
  n.toLocaleString('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 });

function calcFlat(principal: number, annualRate: number, months: number): number {
  if (months === 0 || principal <= 0) return 0;
  return (principal + principal * (annualRate / 100) * (months / 12)) / months;
}

function calcReducing(principal: number, annualRate: number, months: number): number {
  if (months === 0 || principal <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

function FinancingCalculator() {
  const [price, setPrice] = useState(500000);
  const [down, setDown] = useState(100000);
  const [rate, setRate] = useState(15);
  const [months, setMonths] = useState(48);
  const [method, setMethod] = useState<'flat' | 'reducing'>('flat');

  const principal = Math.max(0, price - down);
  const monthly = method === 'flat'
    ? calcFlat(principal, rate, months)
    : calcReducing(principal, rate, months);
  const totalPayable = down + monthly * months;
  const totalInterest = totalPayable - price;

  return (
    <section className="rounded-2xl border border-blue-500/20 bg-gray-900 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Financing Calculator</h2>
        <p className="text-gray-500 text-sm">Estimate your monthly payments instantly.</p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Vehicle Price (EGP)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Down Payment (EGP)</label>
          <input
            type="number"
            value={down}
            onChange={(e) => setDown(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Annual Interest Rate (%)</label>
          <input
            type="number"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-2">Method</label>
          <div className="flex gap-2">
            {(['flat', 'reducing'] as const).map((m) => (
              <button key={m} onClick={() => setMethod(m)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition border ${
                  method === m
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-gray-800 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}>
                {m === 'flat' ? 'Flat Rate' : 'Reducing Balance'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-xs text-gray-500 mb-2">Duration</label>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((d) => (
            <button key={d} onClick={() => setMonths(d)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition border ${
                months === d
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-gray-800 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}>
              {d}m
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="rounded-xl bg-blue-500/5 border border-blue-500/20 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Monthly Installment</p>
          <p className="text-2xl font-bold text-blue-400">{fmt(monthly)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Payable</p>
          <p className="text-lg font-semibold text-white">{fmt(totalPayable)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Interest</p>
          <p className="text-lg font-semibold text-amber-400">{fmt(totalInterest)}</p>
        </div>
      </div>

      <p className="text-xs text-gray-600">
        Estimates are indicative only. Final rates and terms are subject to credit approval.
      </p>

      <Link href="/appointments"
        className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition text-sm">
        Book a Test Drive →
      </Link>
    </section>
  );
}

// ─── Financing Form (existing) ─────────────────────────────────────────────

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

  const downNum = Number(form.downPayment) || 0;
  const financed = vehiclePrice - downNum;
  const monthlyEst = form.purchaseMethod === 'DEALERSHIP_INSTALLMENT' && financed > 0
    ? Math.round((financed * 1.22) / 48)
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) return (
    <div className="rounded-2xl border border-white/5 bg-gray-900 p-8 text-center">
      <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-white mb-3">Inquiry Received!</h2>
      <p className="text-gray-400 mb-6 text-sm">Our financing team will contact you within 24 hours.</p>
      <Link href="/vehicles" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition text-sm">
        Browse More Vehicles
      </Link>
    </div>
  );

  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-1">Financing Inquiry</h2>
      <p className="text-gray-500 text-sm mb-6">Fill in your details and we'll get back to you with tailored options.</p>

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
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

function FinancingPageContent() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">
        <FinancingCalculator />
        <div className="border-t border-white/5" />
        <Suspense fallback={null}>
          <FinancingForm />
        </Suspense>
      </div>
    </div>
  );
}

export default function FinancingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950"><Header /></div>}>
      <FinancingPageContent />
    </Suspense>
  );
}
