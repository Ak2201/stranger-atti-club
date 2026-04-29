'use client';

import { useEffect, useRef, useState } from 'react';
import { verifyAndCheckIn, type CheckInResult } from './actions';

type Status =
  | { kind: 'idle' }
  | { kind: 'scanning' }
  | { kind: 'verifying' }
  | { kind: 'result'; result: CheckInResult };

export default function QrScanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [manual, setManual] = useState('');
  const cooldownRef = useRef<number>(0);

  async function startScan() {
    setStatus({ kind: 'scanning' });
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const id = 'sac-qr-region';
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(id);
      }
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decoded: string) => {
          // Cooldown — avoid double-firing on the same frame
          const now = Date.now();
          if (now - cooldownRef.current < 1500) return;
          cooldownRef.current = now;
          setStatus({ kind: 'verifying' });
          const result = await verifyAndCheckIn(decoded);
          setStatus({ kind: 'result', result });
        },
        () => {
          /* per-frame decode error: ignore */
        }
      );
    } catch (err: any) {
      setStatus({
        kind: 'result',
        result: {
          ok: false,
          reason: 'invalid',
          message: err?.message || 'Could not access camera.',
        },
      });
    }
  }

  async function stopScan() {
    try {
      await scannerRef.current?.stop();
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    return () => {
      stopScan();
    };
  }, []);

  async function submitManual(e: React.FormEvent) {
    e.preventDefault();
    if (!manual.trim()) return;
    setStatus({ kind: 'verifying' });
    // Manual input might be the bare booking id OR a full URL
    const payload = manual.includes('://')
      ? manual.trim()
      : window.location.origin + '/tickets/' + manual.trim();
    const result = await verifyAndCheckIn(payload);
    setStatus({ kind: 'result', result });
    setManual('');
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-4">
        {status.kind === 'idle' ? (
          <div className="grid place-items-center gap-3 py-10 text-center">
            <p className="text-sm text-ink-soft">
              Tap to open your phone camera and scan attendee QRs.
            </p>
            <button
              onClick={startScan}
              className="rounded-full bg-crimson px-6 py-3 text-sm font-semibold text-cream"
            >
              Start scanning
            </button>
          </div>
        ) : (
          <div>
            <div
              id="sac-qr-region"
              ref={containerRef}
              className="aspect-square w-full overflow-hidden rounded-2xl bg-black"
            />
            <div className="mt-3 flex justify-between">
              <span className="text-xs text-ink-mute">
                {status.kind === 'verifying'
                  ? 'Verifying…'
                  : 'Scanning — point the camera at the QR.'}
              </span>
              <button
                onClick={() => {
                  stopScan();
                  setStatus({ kind: 'idle' });
                }}
                className="text-xs text-crimson hover:underline"
              >
                Stop
              </button>
            </div>
          </div>
        )}
      </div>

      {status.kind === 'result' && <ResultCard result={status.result} />}

      <form onSubmit={submitManual} className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-4">
        <p className="text-xs uppercase tracking-wider text-ink-mute">
          Or enter booking ID
        </p>
        <div className="mt-2 flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="booking-id or full ticket URL"
            className="flex-1 rounded-xl border border-marigold-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-crimson"
          />
          <button
            type="submit"
            className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-cream"
          >
            Check in
          </button>
        </div>
      </form>
    </div>
  );
}

function ResultCard({ result }: { result: CheckInResult }) {
  if (!result.ok) {
    return (
      <div className="rounded-3xl border-2 border-crimson bg-crimson/5 p-6">
        <p className="font-display text-xl text-crimson">✗ Rejected</p>
        <p className="mt-1 text-sm text-crimson/90">{result.message}</p>
      </div>
    );
  }
  if (result.alreadyCheckedIn) {
    return (
      <div className="rounded-3xl border-2 border-marigold-300 bg-marigold-50 p-6">
        <p className="font-display text-xl text-marigold-700">
          ⏱ Already checked in
        </p>
        <p className="mt-1 text-sm text-marigold-700/90">
          {result.attendeeName} arrived at{' '}
          {new Date(result.previousCheckIn || result.checkedInAt).toLocaleTimeString(
            'en-IN',
            { hour: '2-digit', minute: '2-digit' }
          )}
          .
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-3xl border-2 border-leaf bg-emerald-50 p-6">
      <p className="font-display text-xl text-emerald-700">✓ Checked in</p>
      <p className="mt-1 text-sm text-emerald-900">
        <strong>{result.attendeeName}</strong> · {result.tier} · checked in{' '}
        {new Date(result.checkedInAt).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  );
}
