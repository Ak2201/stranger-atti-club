'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  lookupBySearch,
  lookupFromQr,
  redeem,
  voidRedemption,
} from './actions';
import type { LookupResult, RedemptionRow } from '@/lib/coupons';

const QUICK_AMOUNTS = [50, 100, 200, 500];

type Props = {
  isSuperAdmin: boolean;
  currentEmail: string;
  initialQrPayload?: string;
};

export default function RedeemPanel({
  isSuperAdmin,
  currentEmail,
  initialQrPayload,
}: Props) {
  const [lookup, setLookup] = useState<
    LookupResult | { ok: false; reason: string; message: string } | null
  >(null);
  const [recent, setRecent] = useState<RedemptionRow[]>([]);
  const [search, setSearch] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState('');
  const [station, setStation] = useState<string>('bar');
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (initialQrPayload) {
      runLookup(() => lookupFromQr(initialQrPayload));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runLookup(call: () => Promise<typeof lookup>) {
    setFeedback(null);
    startTransition(async () => {
      const res = await call();
      setLookup(res);
      if (res && res.ok) setRecent(res.recent);
      else setRecent([]);
    });
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    runLookup(() => lookupBySearch(search.trim()));
  }

  function onScanResult(payload: string) {
    runLookup(() => lookupFromQr(payload));
  }

  // Expose to parent scanner via window event
  useEffect(() => {
    function handler(e: any) {
      onScanResult(String(e.detail || ''));
    }
    window.addEventListener('sac:qr-scanned', handler as EventListener);
    return () =>
      window.removeEventListener('sac:qr-scanned', handler as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function doRedeem() {
    if (!lookup || !lookup.ok || !amount) return;
    const bId = lookup.booking.id;
    setFeedback(null);
    startTransition(async () => {
      const res = await redeem({
        bookingId: bId,
        amountInr: amount,
        note: note.trim() || undefined,
        station,
      });
      if (res.ok) {
        // Refresh booking + recent
        const fresh = await lookupBySearch(bId);
        setLookup(fresh);
        if (fresh.ok) setRecent(fresh.recent);
        setAmount(0);
        setNote('');
        setFeedback(`Redeemed ₹${amount}. ₹${res.newRemaining} left.`);
      } else {
        setFeedback(`✗ ${res.message}`);
      }
    });
  }

  function doVoid(redemptionId: string) {
    setFeedback(null);
    startTransition(async () => {
      const res = await voidRedemption(redemptionId);
      if (res.ok && lookup && lookup.ok) {
        const fresh = await lookupBySearch(lookup.booking.id);
        setLookup(fresh);
        if (fresh.ok) setRecent(fresh.recent);
        setFeedback(`Voided · ₹${res.restored} returned.`);
      } else if (!res.ok) {
        setFeedback(`✗ ${res.message}`);
      }
    });
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={onSearch}
        className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-4"
      >
        <p className="text-xs uppercase tracking-wider text-ink-mute">
          Search (fallback)
        </p>
        <div className="mt-2 flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, phone, or full booking ID"
            className="flex-1 rounded-xl border border-marigold-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-crimson"
          />
          <button
            type="submit"
            className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-cream"
          >
            Look up
          </button>
        </div>
      </form>

      {feedback && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.startsWith('✗')
              ? 'border-crimson/30 bg-crimson/5 text-crimson'
              : 'border-leaf/40 bg-leaf/10 text-emerald-700'
          }`}
        >
          {feedback}
        </div>
      )}

      {lookup && !lookup.ok && (
        <div className="rounded-3xl border-2 border-crimson bg-crimson/5 p-6">
          <p className="font-display text-xl text-crimson">✗ Rejected</p>
          <p className="mt-1 text-sm text-crimson/90">{lookup.message}</p>
        </div>
      )}

      {lookup && lookup.ok && (
        <RedeemCard
          lookup={lookup}
          recent={recent}
          amount={amount}
          setAmount={setAmount}
          note={note}
          setNote={setNote}
          station={station}
          setStation={setStation}
          onRedeem={doRedeem}
          onVoid={doVoid}
          pending={pending}
          isSuperAdmin={isSuperAdmin}
          currentEmail={currentEmail}
        />
      )}
    </div>
  );
}

function RedeemCard({
  lookup,
  recent,
  amount,
  setAmount,
  note,
  setNote,
  station,
  setStation,
  onRedeem,
  onVoid,
  pending,
  isSuperAdmin,
  currentEmail,
}: {
  lookup: Extract<LookupResult, { ok: true }>;
  recent: RedemptionRow[];
  amount: number;
  setAmount: (n: number) => void;
  note: string;
  setNote: (s: string) => void;
  station: string;
  setStation: (s: string) => void;
  onRedeem: () => void;
  onVoid: (id: string) => void;
  pending: boolean;
  isSuperAdmin: boolean;
  currentEmail: string;
}) {
  const b = lookup.booking;
  const remaining = b.couponRemainingInr;
  const fullyRedeemed = remaining <= 0;
  const overBudget = amount > remaining;
  const accent = useMemo(() => {
    const pct = b.couponInitialInr ? remaining / b.couponInitialInr : 0;
    if (pct > 0.5) return 'bg-leaf';
    if (pct > 0.2) return 'bg-marigold-400';
    return 'bg-crimson';
  }, [remaining, b.couponInitialInr]);

  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-marigold-200/60 bg-cream-50">
        <header className="bg-gradient-to-br from-marigold-300 via-marigold-400 to-crimson p-5 text-cream">
          <p className="text-xs uppercase tracking-[0.25em]">{b.eventName}</p>
          <p className="mt-1 font-display text-2xl">{b.contactName}</p>
          <p className="mt-1 text-sm text-cream/85">
            {b.tierId} · status {b.status}
          </p>
        </header>

        <div className="p-5">
          <div className="rounded-2xl border border-marigold-200/60 bg-cream p-4">
            <p className="text-xs uppercase tracking-wider text-ink-mute">
              Bar credit remaining
            </p>
            <p className="mt-1 font-display text-4xl">
              ₹{remaining.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-ink-mute">
              ₹{b.couponRedeemedInr} used of ₹{b.couponInitialInr}
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-marigold-100">
              <div
                className={`h-full ${accent}`}
                style={{
                  width: `${b.couponInitialInr ? Math.max(0, (remaining / b.couponInitialInr) * 100) : 0}%`,
                }}
              />
            </div>
          </div>

          {fullyRedeemed ? (
            <p className="mt-5 rounded-2xl border border-marigold-200/60 bg-marigold-50 px-4 py-3 text-sm text-marigold-700">
              Fully redeemed. Nothing more to deduct.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={n > remaining}
                    onClick={() => setAmount(n)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      amount === n
                        ? 'border-crimson bg-crimson text-cream'
                        : 'border-marigold-200 bg-white text-ink hover:border-crimson hover:text-crimson'
                    } disabled:opacity-40`}
                  >
                    ₹{n}
                  </button>
                ))}
              </div>

              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-wider text-ink-mute">
                  Custom amount (₹)
                </span>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={amount || ''}
                  onChange={(e) =>
                    setAmount(parseInt(e.target.value || '0', 10) || 0)
                  }
                  className={`w-full rounded-xl border px-4 py-3 text-ink outline-none focus:border-crimson ${
                    overBudget
                      ? 'border-crimson bg-crimson/5'
                      : 'border-marigold-200 bg-white'
                  }`}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-wider text-ink-mute">
                  Note (optional)
                </span>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="1 cocktail + chips"
                  className="w-full rounded-xl border border-marigold-200 bg-white px-4 py-3 text-ink outline-none focus:border-crimson"
                />
              </label>

              <div>
                <span className="mb-1 block text-xs uppercase tracking-wider text-ink-mute">
                  Station
                </span>
                <div className="flex flex-wrap gap-2">
                  {['bar', 'food', 'merch', 'other'].map((s) => (
                    <label
                      key={s}
                      className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${
                        station === s
                          ? 'border-crimson bg-crimson/10 text-crimson'
                          : 'border-marigold-200 bg-white text-ink-soft'
                      }`}
                    >
                      <input
                        type="radio"
                        name="station"
                        value={s}
                        checked={station === s}
                        onChange={() => setStation(s)}
                        className="sr-only"
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <button
                disabled={pending || !amount || overBudget}
                onClick={onRedeem}
                className="w-full rounded-2xl bg-crimson px-6 py-4 font-semibold text-cream transition hover:bg-crimson-500 disabled:opacity-50"
              >
                {pending
                  ? 'Redeeming…'
                  : overBudget
                    ? `Exceeds remaining (₹${remaining})`
                    : `Redeem ₹${amount || 0}`}
              </button>
            </div>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-display text-lg">Recent redemptions</h3>
        {recent.length === 0 ? (
          <p className="rounded-2xl border border-marigold-200/60 bg-cream-50 p-4 text-sm text-ink-mute">
            None yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {recent.map((r) => {
              const ageMs = Date.now() - r.createdAt.getTime();
              const sameVendor =
                r.vendorEmail.toLowerCase() === currentEmail.toLowerCase();
              const canSelfVoid =
                !r.voidedAt && sameVendor && ageMs < 60_000;
              const canSuperVoid = !r.voidedAt && isSuperAdmin;
              return (
                <li
                  key={r.id}
                  className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${
                    r.voidedAt
                      ? 'border-marigold-100 bg-cream text-ink-mute line-through'
                      : 'border-marigold-200/60 bg-cream-50'
                  }`}
                >
                  <span className="font-display text-base">
                    ₹{r.amountInr}
                  </span>
                  <span className="text-xs">
                    {r.station ? `· ${r.station}` : ''}{' '}
                    {r.note ? `· ${r.note}` : ''}
                  </span>
                  <span className="ml-auto text-[11px] text-ink-mute">
                    {r.createdAt.toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    · {r.vendorEmail.split('@')[0]}
                  </span>
                  {canSelfVoid && (
                    <button
                      onClick={() => onVoid(r.id)}
                      disabled={pending}
                      className="rounded-full bg-marigold-200 px-2.5 py-1 text-[10px] font-semibold text-marigold-800"
                    >
                      Undo
                    </button>
                  )}
                  {!canSelfVoid && canSuperVoid && (
                    <button
                      onClick={() => onVoid(r.id)}
                      disabled={pending}
                      className="rounded-full bg-crimson/10 px-2.5 py-1 text-[10px] font-semibold text-crimson"
                    >
                      Void
                    </button>
                  )}
                  {r.voidedAt && (
                    <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-mute">
                      Voided
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
