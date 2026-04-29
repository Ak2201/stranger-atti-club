'use client';

import { useEffect, useRef, useState } from 'react';

export default function RedeemScanner() {
  const scannerRef = useRef<any>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cooldownRef = useRef<number>(0);

  async function start() {
    setError(null);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const id = 'sac-redeem-scanner';
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(id);
      }
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded: string) => {
          const now = Date.now();
          if (now - cooldownRef.current < 1500) return;
          cooldownRef.current = now;
          // Hand off to the panel via a custom event so we don't tightly couple components.
          window.dispatchEvent(
            new CustomEvent('sac:qr-scanned', { detail: decoded })
          );
        },
        () => {
          /* per-frame decode error: ignore */
        }
      );
      setActive(true);
    } catch (err: any) {
      setError(err?.message || 'Could not access camera.');
    }
  }

  async function stop() {
    try {
      await scannerRef.current?.stop();
    } catch {
      /* ignore */
    }
    setActive(false);
  }

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return (
    <div className="rounded-3xl border border-marigold-200/60 bg-cream-50 p-4">
      {error && (
        <p className="mb-3 rounded-xl border border-crimson/30 bg-crimson/5 px-3 py-2 text-xs text-crimson">
          {error}
        </p>
      )}
      {!active ? (
        <div className="grid place-items-center gap-3 py-8 text-center">
          <p className="text-sm text-ink-soft">
            Open the phone camera and scan attendee QRs.
          </p>
          <button
            onClick={start}
            className="rounded-full bg-crimson px-6 py-3 text-sm font-semibold text-cream"
          >
            Start scanning
          </button>
        </div>
      ) : (
        <div>
          <div
            id="sac-redeem-scanner"
            className="aspect-square w-full overflow-hidden rounded-2xl bg-black"
          />
          <div className="mt-3 flex justify-between">
            <span className="text-xs text-ink-mute">
              Aim the camera at the QR. Result appears below.
            </span>
            <button
              onClick={stop}
              className="text-xs text-crimson hover:underline"
            >
              Stop
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
