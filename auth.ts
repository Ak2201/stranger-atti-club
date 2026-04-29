import NextAuth, { type NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

const HAS_GOOGLE =
  !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;
const HAS_DB = !!process.env.TURSO_DATABASE_URL;

export type Role = 'user' | 'admin' | 'super_admin' | 'vendor';

function emailSet(envVar: string): Set<string> {
  return new Set(
    (process.env[envVar] || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  // Demo placeholder user is super_admin so the full UI is reachable in dev.
  if (!HAS_GOOGLE && email === 'demo@strangeratticlub.in') return true;
  return emailSet('SUPER_ADMIN_EMAILS').has(email.toLowerCase());
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  // Super admin implies admin access.
  if (isSuperAdminEmail(email)) return true;
  return emailSet('ADMIN_EMAILS').has(email.toLowerCase());
}

export function isVendorEmail(email?: string | null): boolean {
  if (!email) return false;
  return emailSet('VENDOR_EMAILS').has(email.toLowerCase());
}

export function resolveRole(email?: string | null): Role {
  if (!email) return 'user';
  if (isSuperAdminEmail(email)) return 'super_admin';
  if (isAdminEmail(email)) return 'admin';
  if (isVendorEmail(email)) return 'vendor';
  return 'user';
}

/**
 * Demo mode: when Google OAuth env vars aren't set, expose a single
 * "demo user" credentials provider so the auth flow is testable end-to-end
 * without external services. Click "Sign in" and you become a fixed demo user.
 *
 * Production mode: Google OAuth + Drizzle adapter writing to Turso.
 */
const config: NextAuthConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET || 'dev-only-secret-please-change',
  ...(HAS_DB ? { adapter: DrizzleAdapter(db as any) } : {}),
  session: {
    strategy: HAS_DB && HAS_GOOGLE ? 'database' : 'jwt',
  },
  providers: HAS_GOOGLE
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID!,
          clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : [
        Credentials({
          id: 'demo',
          name: 'Demo',
          credentials: {
            email: { label: 'Email', type: 'email', placeholder: 'demo@strangeratticlub.in' },
            password: { label: 'Password', type: 'password' },
          },
          async authorize(creds) {
            const expectedEmail = (
              process.env.DEMO_AUTH_EMAIL || 'demo@strangeratticlub.in'
            ).toLowerCase();
            const expectedPassword =
              process.env.DEMO_AUTH_PASSWORD || '12345678';
            const email = String(creds?.email || '').trim().toLowerCase();
            const password = String(creds?.password || '');
            if (email !== expectedEmail || password !== expectedPassword) {
              return null;
            }
            const name = 'Demo Atti';
            const image =
              'https://api.dicebear.com/9.x/initials/svg?seed=Demo%20Atti&backgroundColor=B22222&textColor=FFF8E7';
            // Upsert a real user row so bookings can FK to it and QR/ticket
            // flows work identically to a real Google sign-in.
            try {
              const existing = await db
                .select()
                .from(schema.users)
                .where(eq(schema.users.email, email))
                .get();
              if (existing) {
                await db
                  .update(schema.users)
                  .set({
                    role:
                      existing.role === 'super_admin' ? existing.role : 'super_admin',
                    lastSeenAt: new Date(),
                  })
                  .where(eq(schema.users.id, existing.id));
                return {
                  id: existing.id,
                  email: existing.email,
                  name: existing.name || name,
                  image: existing.image || image,
                };
              }
              const id = crypto.randomUUID();
              await db.insert(schema.users).values({
                id,
                email,
                name,
                image,
                role: 'super_admin',
                lastSeenAt: new Date(),
              });
              return { id, email, name, image };
            } catch (err) {
              console.warn('[auth] demo upsert failed, using synthetic id:', err);
              return { id: 'demo-user', email, name, image };
            }
          },
        }),
      ],
  callbacks: {
    async signIn({ user }) {
      // On every sign-in, sync role from env-var allow-lists.
      // Idempotent — only affects DB-backed sessions.
      if (HAS_DB && user?.email) {
        const role = resolveRole(user.email);
        if (role !== 'user') {
          try {
            await db
              .update(schema.users)
              .set({ role })
              .where(eq(schema.users.email, user.email));
          } catch (err) {
            console.warn('[auth] failed to sync role:', err);
          }
        }
      }
      return true;
    },
    async session({ session, user, token }) {
      if (!session.user) return session;
      session.user.id = (user?.id ?? token?.sub ?? 'demo-user') as string;

      // Resolve role: env-var allow-list wins (so demo user stays super_admin
      // even before the DB write completes), else fall back to DB row.
      let role: Role = resolveRole(session.user.email);

      if (role === 'user' && HAS_DB && session.user.email) {
        try {
          const row = await db
            .select({ role: schema.users.role })
            .from(schema.users)
            .where(eq(schema.users.email, session.user.email))
            .get();
          if (row?.role === 'admin' || row?.role === 'super_admin') {
            role = row.role as Role;
          }
        } catch {
          /* fall through */
        }
      }

      // Bump lastSeenAt so /admin/users can show "active recently".
      if (HAS_DB && session.user.email) {
        try {
          await db
            .update(schema.users)
            .set({ lastSeenAt: new Date() })
            .where(eq(schema.users.email, session.user.email));
        } catch {
          /* ignore */
        }
      }

      (session.user as { role?: Role }).role = role;
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(config);
