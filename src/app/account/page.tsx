'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001/api/v1';
const fmt = (n: number | string) => 'EGP ' + Number(n).toLocaleString('en-EG', { maximumFractionDigits: 0 });
const fmtDate = (d: string | Date) => new Date(d).toLocaleDateString('en-EG', { year: 'numeric', month: 'short', day: 'numeric' });

type Nav = 'deals' | 'finance' | 'installments' | 'profile' | 'favorites';

const DOC_TYPES = [
  { key: 'NATIONAL_ID_FRONT', label: 'National ID (Front)' },
  { key: 'NATIONAL_ID_BACK', label: 'National ID (Back)' },
  { key: 'PROOF_OF_INCOME', label: 'Proof of Income / Salary Certificate' },
  { key: 'BANK_STATEMENT', label: 'Bank Statement (last 3 months)' },
  { key: 'CAR_LICENSE_BAYAN', label: 'Car License / Bayan' },
];

const FINANCING_STEPS = [
  { key: 'DOCUMENTS_PENDING', label: 'Documents' },
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'APPROVED', label: 'Approved' },
];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'var(--text-3)',
  PENDING: 'var(--warning-fg)',
  FINALIZED: 'var(--success-fg)',
  CANCELLED: 'var(--danger-fg)',
  ACTIVE: 'var(--success-fg)',
  OVERDUE: 'var(--danger-fg)',
  COMPLETED: 'var(--primary)',
  PAID: 'var(--success-fg)',
};

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('b2c_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...(opts?.headers as Record<string, string> ?? {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Status badge ─────────────────────────────────────────────────────────────

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.6rem',
      borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em',
      background: `${color ?? 'var(--primary)'}18`, color: color ?? 'var(--primary)',
      textTransform: 'uppercase',
    }}>{label}</span>
  );
}

// ── Bank financing timeline ───────────────────────────────────────────────────

function FinanceTimeline({ app, dealId, onDocUploaded }: {
  app: any;
  dealId: string;
  onDocUploaded: () => void;
}) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragDocType, setDragDocType] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const status: string = app.bankFinancingStatus ?? 'DOCUMENTS_PENDING';
  const stepIdx = FINANCING_STEPS.findIndex(s => s.key === status);
  const rejected = status === 'REJECTED';

  async function uploadDoc(docType: string, file: File) {
    setUploading(docType);
    try {
      // ponytail: upload to /upload first, then register doc
      const fd = new FormData(); fd.append('file', file);
      const up = await fetch(`${API}/upload`, { method: 'POST', headers: authHeaders() as HeadersInit, body: fd });
      const { url } = await up.json();
      await apiFetch(`/public/account/deals/${dealId}/documents`, {
        method: 'POST',
        body: JSON.stringify({ documentType: docType, fileUrl: url }),
      });
      onDocUploaded();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Timeline */}
      {!rejected && (
        <div>
          <p style={{ fontWeight: 700, color: 'var(--text-1)', marginBottom: '1rem' }}>Financing Progress</p>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {FINANCING_STEPS.map((step, i) => {
              const done = i <= stepIdx;
              const active = i === stepIdx;
              return (
                <div key={step.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  {i > 0 && <div style={{ position: 'absolute', left: 0, top: 10, width: '50%', height: 2, background: done ? 'var(--success)' : 'var(--border)' }} />}
                  {i < FINANCING_STEPS.length - 1 && <div style={{ position: 'absolute', right: 0, top: 10, width: '50%', height: 2, background: i < stepIdx ? 'var(--success)' : 'var(--border)' }} />}
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', zIndex: 1, position: 'relative',
                    background: done ? 'var(--success)' : 'var(--surface)',
                    border: `2px solid ${done ? 'var(--success)' : active ? 'var(--primary)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: done ? '#fff' : 'var(--text-3)', fontSize: '0.6875rem', fontWeight: 700,
                  }}>{done ? '✓' : i + 1}</div>
                  <p style={{ fontSize: '0.6875rem', color: done ? 'var(--success-fg)' : 'var(--text-3)', marginTop: '0.375rem', textAlign: 'center', lineHeight: 1.3 }}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rejected banner */}
      {rejected && (
        <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 8, padding: '1rem' }}>
          <p style={{ fontWeight: 700, color: 'var(--danger-fg)', marginBottom: '0.35rem' }}>Application Rejected</p>
          {app.rejectionReason && <p style={{ fontSize: '0.875rem', color: 'var(--danger-fg)' }}>{app.rejectionReason}</p>}
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-3)', marginTop: '0.5rem' }}>Contact your sales rep to reapply or switch payment method.</p>
        </div>
      )}

      {/* Approved info */}
      {status === 'APPROVED' && app.bankApproval && (
        <div style={{ background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 8, padding: '1rem' }}>
          <p style={{ fontWeight: 700, color: 'var(--success-fg)', marginBottom: '0.5rem' }}>Bank Approved</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
            <div><p style={{ color: 'var(--text-3)' }}>Approved Amount</p><p style={{ fontWeight: 700, color: 'var(--text-1)' }}>{fmt(app.bankApproval.approvedAmount)}</p></div>
            <div><p style={{ color: 'var(--text-3)' }}>Approval Date</p><p style={{ fontWeight: 700, color: 'var(--text-1)' }}>{fmtDate(app.bankApproval.approvalDate)}</p></div>
            <div><p style={{ color: 'var(--text-3)' }}>Reference No.</p><p style={{ fontWeight: 700, color: 'var(--text-1)' }}>{app.bankApproval.approvalReferenceNumber}</p></div>
          </div>
        </div>
      )}

      {/* Document checklist */}
      <div>
        <p style={{ fontWeight: 700, color: 'var(--text-1)', marginBottom: '0.875rem' }}>Document Checklist</p>

        {/* Drag-and-drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={async e => {
            e.preventDefault(); setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file && dragDocType) uploadDoc(dragDocType, file);
          }}
          style={{
            border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 8, padding: '1.25rem', textAlign: 'center', marginBottom: '1rem',
            background: dragOver ? 'var(--primary-light)' : 'var(--surface)',
            transition: 'all 0.15s',
          }}
        >
          <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: '0.35rem' }}>
            Drag & drop a file here
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <select
              value={dragDocType}
              onChange={e => setDragDocType(e.target.value)}
              style={{ fontSize: '0.8125rem', padding: '0.3rem 0.5rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-1)' }}
            >
              <option value="">Select document type</option>
              {DOC_TYPES.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
            </select>
          </div>
        </div>

        {/* Per-type upload rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {DOC_TYPES.map(dt => {
            const doc = app.requiredDocuments?.find((d: any) => d.documentType === dt.key);
            const docStatus: string = doc?.status ?? 'PENDING';
            const statusColor = docStatus === 'VERIFIED' ? 'var(--success-fg)' : docStatus === 'REJECTED' ? 'var(--danger-fg)' : docStatus === 'SUBMITTED' ? 'var(--primary)' : 'var(--text-3)';
            return (
              <div key={dt.key} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.625rem 0.875rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1rem' }}>{docStatus === 'VERIFIED' ? '✅' : docStatus === 'REJECTED' ? '❌' : docStatus === 'SUBMITTED' ? '⏳' : '📄'}</span>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)' }}>{dt.label}</p>
                    <p style={{ fontSize: '0.75rem', color: statusColor, textTransform: 'uppercase', fontWeight: 700 }}>{docStatus}</p>
                  </div>
                </div>
                <label style={{ cursor: uploading === dt.key ? 'wait' : 'pointer' }}>
                  <input
                    ref={dt.key === DOC_TYPES[0].key ? fileRef : undefined}
                    type="file" style={{ display: 'none' }}
                    onChange={async e => { const f = e.target.files?.[0]; if (f) await uploadDoc(dt.key, f); }}
                    disabled={!!uploading}
                  />
                  <span className="btn btn-outline btn-sm" style={{ pointerEvents: 'none' }}>
                    {uploading === dt.key ? '…' : doc ? 'Replace' : 'Upload'}
                  </span>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Installment plan section ─────────────────────────────────────────────────

function InstallmentSection({ plan }: { plan: any }) {
  const [expanded, setExpanded] = useState(false);
  if (!plan) return <p style={{ color: 'var(--text-3)' }}>No installment plan on this deal.</p>;

  const lines: any[] = plan.installments ?? [];
  const paid = lines.filter((l: any) => l.status === 'PAID').length;
  const overdue = lines.filter((l: any) => l.status === 'OVERDUE').length;
  const nextDue = lines.find((l: any) => l.status === 'PENDING' || l.status === 'OVERDUE');
  const totalPaid = lines.filter((l: any) => l.status === 'PAID').reduce((s: number, l: any) => s + Number(l.paidAmount ?? l.totalDue), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Total Payable', value: fmt(plan.totalPayable), color: 'var(--text-1)' },
          { label: 'Paid So Far', value: fmt(totalPaid), color: 'var(--success-fg)' },
          { label: 'Remaining', value: fmt(Number(plan.totalPayable) - totalPaid), color: 'var(--warning-fg)' },
          { label: 'Installments', value: `${paid} / ${lines.length}`, color: 'var(--primary)' },
        ].map(c => (
          <div key={c.label} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }}>{c.label}</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Next due / overdue alert */}
      {overdue > 0 && (
        <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 8, padding: '0.875rem' }}>
          <p style={{ fontWeight: 700, color: 'var(--danger-fg)' }}>⚠️ {overdue} overdue installment{overdue > 1 ? 's' : ''}</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', marginTop: '0.25rem' }}>Contact your sales rep to arrange payment.</p>
        </div>
      )}
      {nextDue && overdue === 0 && (
        <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)', borderRadius: 8, padding: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--primary)' }}>Next Payment</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', marginTop: '0.2rem' }}>{fmtDate(nextDue.dueDate)}</p>
          </div>
          <p style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>{fmt(nextDue.totalDue)}</p>
        </div>
      )}

      {/* Collapsible full table */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="btn btn-ghost btn-sm"
        style={{ alignSelf: 'flex-start' }}
      >
        {expanded ? '▲ Hide Schedule' : '▼ View Full Schedule'}
      </button>

      {expanded && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['#', 'Due Date', 'Principal', 'Interest', 'Total Due', 'Status'].map(h => (
                  <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--text-3)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.map((l: any, i: number) => {
                const color = STATUS_COLORS[l.status] ?? 'var(--text-3)';
                return (
                  <tr key={l.id ?? i} style={{ borderBottom: '1px solid var(--border)', background: l.status === 'OVERDUE' ? 'var(--danger-light)' : undefined }}>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-3)' }}>{l.installmentNumber ?? i + 1}</td>
                    <td style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap' }}>{fmtDate(l.dueDate)}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{fmt(l.principalPortion ?? 0)}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{fmt(l.interestPortion ?? 0)}</td>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700 }}>{fmt(l.totalDue)}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <Badge label={l.status} color={color} />
                      {l.paidDate && <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginLeft: 6 }}>{fmtDate(l.paidDate)}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Deal card ─────────────────────────────────────────────────────────────────

function DealCard({ deal, onClick, active }: { deal: any; onClick: () => void; active: boolean }) {
  const imgUrl = deal.vehicle?.images?.[0]?.url;
  const nextInstallment = deal.installmentPlan?.installments?.[0];
  const method = deal.purchaseMethod === 'CASH' ? 'Cash' : deal.purchaseMethod === 'DEALERSHIP_INSTALLMENT' ? 'Installment' : 'Bank Financing';
  const invoice = deal.invoices?.[0];

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', background: active ? 'var(--primary-light)' : 'var(--surface)',
        border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 12,
        overflow: 'hidden', cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      {/* Vehicle image */}
      <div style={{ height: 140, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {imgUrl
          ? <img src={imgUrl} alt={deal.vehicle?.make} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '3rem', color: 'var(--border-strong)' }}>🚗</span>
        }
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <Badge label={deal.status} color={STATUS_COLORS[deal.status]} />
        </div>
      </div>
      <div style={{ padding: '1rem' }}>
        <p style={{ fontWeight: 700, color: 'var(--text-1)', marginBottom: '0.25rem' }}>
          {deal.vehicle?.year} {deal.vehicle?.make} {deal.vehicle?.model}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem 1rem', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
          <div><span style={{ color: 'var(--text-3)' }}>Method</span><p style={{ fontWeight: 600, color: 'var(--text-1)' }}>{method}</p></div>
          <div><span style={{ color: 'var(--text-3)' }}>Total</span><p style={{ fontWeight: 600, color: 'var(--text-1)' }}>{invoice ? fmt(invoice.amountTotal) : '—'}</p></div>
          {nextInstallment && (
            <div style={{ gridColumn: '1 / -1', marginTop: '0.25rem', padding: '0.5rem 0.625rem', background: nextInstallment.status === 'OVERDUE' ? 'var(--danger-light)' : 'var(--primary-light)', borderRadius: 6 }}>
              <span style={{ fontSize: '0.75rem', color: nextInstallment.status === 'OVERDUE' ? 'var(--danger-fg)' : 'var(--primary)', fontWeight: 700 }}>
                {nextInstallment.status === 'OVERDUE' ? '⚠️ OVERDUE' : 'Next Due'}: {fmt(nextInstallment.totalDue)} · {fmtDate(nextInstallment.dueDate)}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Main account page ─────────────────────────────────────────────────────────

function AccountContent() {
  const router = useRouter();
  const [nav, setNav] = useState<Nav>('deals');
  const [deals, setDeals] = useState<any[]>([]);
  const [activeDeal, setActiveDeal] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const load = useCallback(async () => {
    const token = localStorage.getItem('b2c_token');
    if (!token) { router.push('/login'); return; }
    try {
      const [d, p, f] = await Promise.all([
        apiFetch('/public/account/deals'),
        apiFetch('/public/account/profile'),
        apiFetch('/public/favorites'),
      ]);
      setDeals(d);
      setProfile(p);
      setProfileForm({ name: p.name ?? '', phone: p.phone ?? '' });
      setFavorites(f);
      if (d.length > 0) setActiveDeal(d[0]);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  async function saveProfile() {
    setSaving(true);
    try {
      const updated = await apiFetch('/public/account/profile', {
        method: 'PATCH', body: JSON.stringify(profileForm),
      });
      setProfile(updated);
      setSaveMsg('Saved!');
      setTimeout(() => setSaveMsg(''), 2500);
    } catch (e: unknown) {
      setSaveMsg(e instanceof Error ? e.message : 'Error saving');
    } finally {
      setSaving(false);
    }
  }

  async function removeFav(vehicleId: string) {
    await apiFetch(`/public/favorites/${vehicleId}`, { method: 'DELETE' });
    setFavorites(f => f.filter((v: any) => v.vehicleId !== vehicleId));
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '6rem' }}>
          <p style={{ color: 'var(--text-3)', fontSize: '1.125rem' }}>Loading your account…</p>
        </div>
      </div>
    );
  }

  const NAV_ITEMS: { key: Nav; label: string; icon: string }[] = [
    { key: 'deals', label: 'My Deals', icon: '🚗' },
    { key: 'finance', label: 'Finance Status', icon: '🏦' },
    { key: 'installments', label: 'Installments', icon: '📅' },
    { key: 'profile', label: 'Profile', icon: '👤' },
    { key: 'favorites', label: 'Saved Vehicles', icon: '❤️' },
  ];

  const bankDeal = deals.find((d: any) => d.purchaseMethod === 'BANK_FINANCING');
  const installmentDeal = deals.find((d: any) => d.purchaseMethod === 'DEALERSHIP_INSTALLMENT');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>

        {/* Profile header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, flexShrink: 0,
          }}>
            {(profile?.name ?? 'U').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: '0.2rem' }}>
              {profile?.name ?? 'Customer'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>
              {profile?.email} · Member since {profile?.createdAt ? fmtDate(profile.createdAt) : '—'}
            </p>
          </div>
          <button
            onClick={() => { localStorage.removeItem('b2c_token'); router.push('/login'); }}
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: 'auto' }}
          >
            Sign Out
          </button>
        </div>

        {/* Layout: sidebar + content */}
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>

          {/* Sidebar nav */}
          <div className="card" style={{ padding: '0.5rem', position: 'sticky', top: '1rem' }}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                onClick={() => setNav(item.key)}
                style={{
                  width: '100%', textAlign: 'left', padding: '0.75rem 1rem', borderRadius: 8,
                  background: nav === item.key ? 'var(--primary)' : 'transparent',
                  color: nav === item.key ? '#fff' : 'var(--text-2)',
                  border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.2rem',
                  transition: 'all 0.15s',
                }}
              >
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </div>

          {/* Content area */}
          <div>

            {/* ── My Deals ── */}
            {nav === 'deals' && (
              <div>
                <h3 style={{ fontWeight: 800, color: 'var(--text-1)', fontSize: '1.125rem', marginBottom: '1.25rem' }}>My Deals</h3>
                {deals.length === 0 ? (
                  <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>🚗</p>
                    <p style={{ color: 'var(--text-3)' }}>No deals yet.</p>
                    <Link href="/vehicles" className="btn btn-primary btn-sm" style={{ marginTop: '1rem', display: 'inline-flex', textDecoration: 'none' }}>
                      Browse Inventory
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {deals.map((deal: any) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        active={activeDeal?.id === deal.id}
                        onClick={() => { setActiveDeal(deal); }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Finance Status ── */}
            {nav === 'finance' && (
              <div>
                <h3 style={{ fontWeight: 800, color: 'var(--text-1)', fontSize: '1.125rem', marginBottom: '1.25rem' }}>Finance Application Status</h3>
                {!bankDeal ? (
                  <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-3)' }}>No bank financing application found.</p>
                  </div>
                ) : (
                  <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ fontWeight: 700, color: 'var(--text-1)' }}>
                        {bankDeal.vehicle?.year} {bankDeal.vehicle?.make} {bankDeal.vehicle?.model}
                      </p>
                      <Badge label={bankDeal.financeApplication?.bankFinancingStatus ?? '—'} color="var(--primary)" />
                    </div>
                    <FinanceTimeline
                      app={bankDeal.financeApplication}
                      dealId={bankDeal.id}
                      onDocUploaded={load}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── Installments ── */}
            {nav === 'installments' && (
              <div>
                <h3 style={{ fontWeight: 800, color: 'var(--text-1)', fontSize: '1.125rem', marginBottom: '1.25rem' }}>Installment Plan</h3>
                {!installmentDeal ? (
                  <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-3)' }}>No installment plan found.</p>
                  </div>
                ) : (
                  <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ fontWeight: 700, color: 'var(--text-1)' }}>
                        {installmentDeal.vehicle?.year} {installmentDeal.vehicle?.make} {installmentDeal.vehicle?.model}
                      </p>
                      <Badge
                        label={installmentDeal.installmentPlan?.status ?? '—'}
                        color={STATUS_COLORS[installmentDeal.installmentPlan?.status] ?? 'var(--primary)'}
                      />
                    </div>
                    <InstallmentSection plan={installmentDeal.installmentPlan} />
                  </div>
                )}
              </div>
            )}

            {/* ── Profile ── */}
            {nav === 'profile' && (
              <div>
                <h3 style={{ fontWeight: 800, color: 'var(--text-1)', fontSize: '1.125rem', marginBottom: '1.25rem' }}>My Profile</h3>
                <div className="card" style={{ padding: '1.5rem', maxWidth: 480 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      { label: 'Full Name', key: 'name', type: 'text' },
                      { label: 'Phone', key: 'phone', type: 'tel' },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.375rem' }}>
                          {f.label}
                        </label>
                        <input
                          type={f.type}
                          value={profileForm[f.key as keyof typeof profileForm]}
                          onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                          style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-1)', fontSize: '0.9375rem', boxSizing: 'border-box' }}
                        />
                      </div>
                    ))}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.375rem' }}>Email</label>
                      <input
                        value={profile?.email ?? ''}
                        disabled
                        style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-3)', fontSize: '0.9375rem', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="btn btn-primary btn-sm"
                      >
                        {saving ? 'Saving…' : 'Save Changes'}
                      </button>
                      {saveMsg && <p style={{ fontSize: '0.875rem', color: saveMsg === 'Saved!' ? 'var(--success-fg)' : 'var(--danger-fg)', fontWeight: 600 }}>{saveMsg}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Favorites ── */}
            {nav === 'favorites' && (
              <div>
                <h3 style={{ fontWeight: 800, color: 'var(--text-1)', fontSize: '1.125rem', marginBottom: '1.25rem' }}>Saved Vehicles</h3>
                {favorites.length === 0 ? (
                  <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>❤️</p>
                    <p style={{ color: 'var(--text-3)' }}>No saved vehicles yet.</p>
                    <Link href="/vehicles" className="btn btn-primary btn-sm" style={{ marginTop: '1rem', display: 'inline-flex', textDecoration: 'none' }}>
                      Browse Inventory
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                    {favorites.map((fav: any) => {
                      const v = fav.vehicle;
                      if (!v) return null;
                      return (
                        <div key={fav.vehicleId} className="card" style={{ overflow: 'hidden' }}>
                          <Link href={`/vehicles/${v.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                            <div style={{ height: 120, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {v.images?.[0]?.url
                                ? <img src={v.images[0].url} alt={v.make} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <span style={{ fontSize: '2.5rem', color: 'var(--border-strong)' }}>🚗</span>
                              }
                            </div>
                            <div style={{ padding: '0.875rem' }}>
                              <p style={{ fontWeight: 700, color: 'var(--text-1)', marginBottom: '0.2rem' }}>{v.make} {v.model} {v.year}</p>
                              <p style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>{fmt(v.price ?? v.salePrice ?? 0)}</p>
                            </div>
                          </Link>
                          <div style={{ padding: '0 0.875rem 0.875rem' }}>
                            <button
                              onClick={() => removeFav(fav.vehicleId)}
                              className="btn btn-ghost btn-sm"
                              style={{ width: '100%', color: 'var(--danger-fg)' }}
                            >
                              ✕ Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)' }}><Header /></div>}>
      <AccountContent />
    </Suspense>
  );
}
