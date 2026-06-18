'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
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

function AccountContent() {
  const searchParams = useSearchParams();
  const dealRef = searchParams.get('dealRef');
  const [email, setEmail] = useState('');
  const [looked, setLooked] = useState(false);

  useEffect(() => {
    if (dealRef) setLooked(true);
  }, [dealRef]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">

        {/* Deal Status Lookup */}
        <section className="rounded-2xl border border-white/5 bg-gray-900 p-6">
          <h1 className="text-xl font-bold text-white mb-1">Deal Status</h1>
          <p className="text-gray-500 text-sm mb-5">Enter your email to look up your deal status.</p>

          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => setLooked(true)}
              disabled={!email}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition">
              Look Up
            </button>
          </div>

          {(looked || dealRef) && (
            <div className="mt-4 rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-sm text-blue-300">
              Please visit your nearest branch or call us to check your deal status.
              Alternatively, contact us at{' '}
              <a href="mailto:info@icaregypt.com" className="underline hover:text-white transition">
                info@icaregypt.com
              </a>.
            </div>
          )}
        </section>

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
