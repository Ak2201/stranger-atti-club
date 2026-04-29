'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useState } from 'react';

const HAS_GOOGLE = !!process.env.NEXT_PUBLIC_HAS_GOOGLE_AUTH;

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInInner />
    </Suspense>
  );
}

function SignInInner() {
  const params = useSearchParams();
  const from = params.get('from') || '/me';
  const initialError = params.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    initialError === 'CredentialsSignin'
      ? 'Email or password is wrong.'
      : null
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const result = await signIn('demo', {
      email,
      password,
      redirect: false,
      callbackUrl: from,
    });
    if (!result || result.error) {
      setError('Email or password is wrong.');
      setPending(false);
      return;
    }
    window.location.href = result.url || from;
  }

  return (
    <section className="relative overflow-hidden">
      <div className="paper absolute inset-0" />
      <div className="relative mx-auto flex max-w-md flex-col items-stretch px-5 pb-16 pt-16 sm:pt-24">
        <p className="dot-accent text-center font-display text-xs uppercase tracking-[0.25em] text-crimson sm:text-sm sm:tracking-[0.3em]">
          Welcome back
        </p>
        <h1 className="balance mt-3 text-center font-display text-3xl leading-tight sm:mt-4 sm:text-5xl">
          Sign in to see your tickets.
        </h1>
        <p className="mt-3 text-center text-sm text-ink-soft sm:text-base">
          We use your email to remember which events you've booked, send
          reminders, and drop your event photos here within 48 hours.
        </p>

        {HAS_GOOGLE && (
          <>
            <button
              onClick={() =>
                signIn('google', { callbackUrl: from })
              }
              className="mt-8 inline-flex items-center justify-center gap-3 rounded-full border border-marigold-300 bg-cream-50 px-6 py-3.5 text-base font-semibold text-ink shadow-sm transition hover:border-crimson hover:text-crimson"
            >
              <GoogleGlyph />
              Continue with Google
            </button>
            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-ink-mute">
              <span className="h-px flex-1 bg-marigold-200" />
              or
              <span className="h-px flex-1 bg-marigold-200" />
            </div>
          </>
        )}

        <form
          onSubmit={submit}
          className="mt-6 rounded-3xl border border-marigold-200/60 bg-cream-50 p-6"
        >
          {error && (
            <div className="mb-4 rounded-xl border border-crimson/30 bg-crimson/5 px-3 py-2 text-sm text-crimson">
              {error}
            </div>
          )}
          <Field label="Email">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className={inputClass}
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </Field>
          <button
            type="submit"
            disabled={pending}
            className="mt-2 w-full rounded-full bg-crimson px-6 py-3 font-semibold text-cream transition hover:bg-crimson-500 disabled:opacity-60"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>

          {!HAS_GOOGLE && (
            <p className="mt-5 text-center text-xs text-ink-mute">
              Demo account: <code>demo@strangeratticlub.in</code> · password{' '}
              <code>12345678</code>
            </p>
          )}
        </form>

        <p className="mt-8 text-center text-xs text-ink-mute">
          By continuing you agree to our{' '}
          <Link className="underline hover:text-crimson" href="/code-of-conduct">
            code of conduct
          </Link>{' '}
          and{' '}
          <Link className="underline hover:text-crimson" href="/privacy">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

const inputClass =
  'w-full rounded-xl border border-marigold-200 bg-white px-4 py-3 text-ink outline-none focus:border-crimson';

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-ink-mute">
        {label}
      </span>
      {children}
    </label>
  );
}

function GoogleGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.72v2.26h2.9c1.69-1.56 2.69-3.86 2.69-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.92v2.34A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.96H.92A9 9 0 0 0 0 9c0 1.45.35 2.83.92 4.04l3.03-2.34z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .92 4.96L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}
