'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../../lib/api';
import Header from '../../components/Header';

const HOW_IT_WORKS = [
  {
    step: '1',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'Browse & Inquire',
    desc: 'Find your vehicle and submit a financing inquiry or test drive request.',
  },
  {
    step: '2',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Financing Review',
    desc: 'Our team reviews your application and prepares tailored financing options.',
  },
  {
    step: '3',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    title: 'Drive Away',
    desc: 'Sign the paperwork, complete payment, and pick up your keys.',
  },
];

const CONTACTS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: 'Phone',
    value: '+20 2 0000 0000',
    href: 'tel:+20200000000',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Email',
    value: 'info@icaregypt.com',
    href: 'mailto:info@icaregypt.com',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    label: 'WhatsApp',
    value: '+20 10 0000 0000',
    href: 'https://wa.me/201000000000',
  },
];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'text-gray-400', PENDING_FINANCE: 'text-amber-400',
  APPROVED: 'text-blue-400', FINALIZED: 'text-green-400', CANCELLED: 'text-red-400',
};

interface InstallmentLine { dueDate: string; status: string; totalDue: number; paidAmount: number; }
interface Deal {
  id: string; status: string; purchaseMethod: string; createdAt: string;
  vehicle?: { make: string; model: string; year: number };
  location?: { name: string; phone: string };
  financeApplication?: {
    id: string; status: string;
    bankApproval?: { approvedAmount: number; approvalDate: string; approvalReferenceNumber: string };
  };
  installmentPlan?: {
    id: string; principalAmount: number; downPayment: number; durationMonths: number;
    interestRate: number; startDate: string; status: string;
    installments: InstallmentLine[];
  };
}

const fmt = (n: number) => n.toLocaleString('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 });

function DealStatusLookup() {
  const [email, setEmail] = useState('');
  const [deals, setDeals] = useState<Deal[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch<{ deals: typeof deals }>(`/public/deal-status?email=${encodeURIComponent(email)}`);
      setDeals(res.deals);
    } catch (e: unknown) {
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/5 bg-gray-900 p-6">
      <h2 className="text-lg font-bold text-white mb-1">Check Deal Status</h2>
      <p className="text-gray-500 text-sm mb-4">Enter your email to look up your deal progress.</p>
      <form onSubmit={lookup} className="flex gap-2 mb-4">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required
          className="flex-1 px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
        <button type="submit" disabled={loading || !email}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition">
          {loading ? '…' : 'Look Up'}
        </button>
      </form>
      {deals !== null && deals.length === 0 && (
        <p className="text-gray-500 text-sm">No deals found for this email. Contact us if you need help.</p>
      )}
      {deals && deals.length > 0 && (
        <div className="space-y-3">
          {deals.map((d) => (
            <div key={d.id} className="rounded-xl border border-white/5 bg-gray-800 overflow-hidden">
              <button className="w-full p-4 flex items-center justify-between text-left"
                onClick={() => setExpanded(expanded === d.id ? null : d.id)}>
                <div>
                  <p className="text-white text-sm font-medium">
                    {d.vehicle ? `${d.vehicle.year} ${d.vehicle.make} ${d.vehicle.model}` : `Deal #${d.id.slice(-8)}`}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">{d.location?.name} · {d.purchaseMethod.replace(/_/g, ' ')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${STATUS_COLORS[d.status] ?? 'text-gray-400'}`}>
                    {d.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-gray-600 text-xs">{expanded === d.id ? '▲' : '▼'}</span>
                </div>
              </button>

              {expanded === d.id && (
                <div className="border-t border-white/5 px-4 pb-4 space-y-3">
                  {/* Finance Application */}
                  {d.financeApplication && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Finance Application</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Status</span>
                        <span className={`font-medium ${d.financeApplication.status === 'APPROVED' ? 'text-green-400' : d.financeApplication.status === 'REJECTED' ? 'text-red-400' : 'text-amber-400'}`}>
                          {d.financeApplication.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {d.financeApplication.bankApproval && (
                        <div className="mt-2 rounded-lg bg-green-500/5 border border-green-500/20 p-3">
                          <p className="text-xs text-green-400 font-medium mb-1">Bank Approved</p>
                          <p className="text-white text-sm">{fmt(Number(d.financeApplication.bankApproval.approvedAmount))}</p>
                          <p className="text-xs text-gray-500">Ref: {d.financeApplication.bankApproval.approvalReferenceNumber}</p>
                          <p className="text-xs text-gray-500">{new Date(d.financeApplication.bankApproval.approvalDate).toLocaleDateString('en-EG')}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Installment Plan */}
                  {d.installmentPlan && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Installment Plan</p>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div><span className="text-gray-500">Principal</span> <span className="text-white ml-1">{fmt(Number(d.installmentPlan.principalAmount))}</span></div>
                        <div><span className="text-gray-500">Rate</span> <span className="text-white ml-1">{Number(d.installmentPlan.interestRate)}% / yr</span></div>
                        <div><span className="text-gray-500">Duration</span> <span className="text-white ml-1">{d.installmentPlan.durationMonths} months</span></div>
                        <div><span className="text-gray-500">Status</span> <span className={`ml-1 ${d.installmentPlan.status === 'ACTIVE' ? 'text-blue-400' : 'text-gray-400'}`}>{d.installmentPlan.status}</span></div>
                      </div>
                      {d.installmentPlan.installments.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Next installments:</p>
                          {d.installmentPlan.installments.map((line, i) => (
                            <div key={i} className="flex justify-between text-xs py-1 border-b border-white/5 last:border-0">
                              <span className="text-gray-400">{new Date(line.dueDate).toLocaleDateString('en-EG')}</span>
                              <span className={line.status === 'PAID' ? 'text-green-400' : line.status === 'OVERDUE' ? 'text-red-400' : 'text-white'}>
                                {fmt(Number(line.totalDue))} · {line.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AuthSection({ onLogin }: { onLogin: (user: { name: string; email: string }) => void }) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (tab === 'login') {
        const res = await apiFetch<{ accessToken: string; user: { name: string; email: string } }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        document.cookie = `customer_session=${res.accessToken}; path=/; max-age=${7 * 86400}`;
        onLogin(res.user);
      } else {
        const res = await apiFetch<{ accessToken: string; user: { name: string; email: string } }>('/auth/customer/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        });
        document.cookie = `customer_session=${res.accessToken}; path=/; max-age=${7 * 86400}`;
        onLogin(res.user);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/5 bg-gray-900 p-6 max-w-sm mx-auto">
      <div className="flex gap-1 mb-6 bg-gray-800 rounded-xl p-1">
        {(['login', 'register'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition ${tab === t ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            {t === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-3">
        {tab === 'register' && (
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required
            className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
        )}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
          className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required
          className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition">
          {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>
    </section>
  );
}

function AccountDashboard({ user, onLogout }: { user: { name: string; email: string }; onLogout: () => void }) {
  return (
    <section className="rounded-2xl border border-white/5 bg-gray-900 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-white">{user.name}</h1>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>
        <button onClick={onLogout}
          className="px-3 py-1.5 text-xs text-gray-400 border border-white/10 hover:border-white/20 hover:text-white rounded-lg transition">
          Sign Out
        </button>
      </div>
      <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-sm text-blue-300">
        To check your deal status, visit your nearest branch or contact us at{' '}
        <a href="mailto:info@icaregypt.com" className="underline hover:text-white transition">info@icaregypt.com</a>.
      </div>
    </section>
  );
}

function AccountContent() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = document.cookie.split(';').find((c) => c.trim().startsWith('customer_session='))?.split('=')[1];
    if (token) {
      apiFetch<{ name: string; email: string }>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((u) => setUser(u)).catch(() => {
        document.cookie = 'customer_session=; path=/; max-age=0';
      }).finally(() => setAuthChecked(true));
    } else {
      setAuthChecked(true);
    }
  }, []);

  function logout() {
    document.cookie = 'customer_session=; path=/; max-age=0';
    setUser(null);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">

        {authChecked && (
          user
            ? <AccountDashboard user={user} onLogout={logout} />
            : <AuthSection onLogin={(u) => setUser(u)} />
        )}

        {/* Deal Status Lookup */}
        <DealStatusLookup />

        {/* How It Works */}
        <section>
          <h2 className="text-lg font-bold text-white mb-5">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="rounded-2xl border border-white/5 bg-gray-900 p-5">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                  {s.icon}
                </div>
                <p className="text-xs text-blue-400 font-medium mb-1">Step {s.step}</p>
                <p className="text-sm font-semibold text-white mb-2">{s.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-lg font-bold text-white mb-5">Get in Touch</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CONTACTS.map((c) => (
              <a key={c.label} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="rounded-2xl border border-white/5 bg-gray-900 hover:border-white/20 p-5 flex items-start gap-3 transition group">
                <div className="mt-0.5 text-blue-400 group-hover:text-blue-300 transition shrink-0">
                  {c.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">{c.label}</p>
                  <p className="text-sm text-white font-medium">{c.value}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <div className="text-center pt-4 pb-2">
          <Link href="/vehicles" className="text-blue-400 hover:text-blue-300 text-sm transition">
            Browse our inventory →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950"><Header /></div>}>
      <AccountContent />
    </Suspense>
  );
}
