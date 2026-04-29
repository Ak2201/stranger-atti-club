import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

/**
 * Drizzle + libSQL/Turso client.
 *
 * Always available — uses a local SQLite file by default.
 *  - dev:    `./local.db` in the project root (persistent across restarts)
 *  - Vercel: `/tmp/local.db` (the only writable path in serverless;
 *            ephemeral per cold start — fine for demo, switch to Turso for prod)
 *  - prod:   set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN to a real Turso DB
 */
function defaultDbUrl() {
  if (process.env.TURSO_DATABASE_URL) return process.env.TURSO_DATABASE_URL;
  if (process.env.VERCEL) return 'file:/tmp/local.db';
  return 'file:./local.db';
}

const url = defaultDbUrl();
const authToken = process.env.TURSO_AUTH_TOKEN;

export const dbClient = createClient({ url, authToken });
export const db = drizzle(dbClient, { schema });
export type Db = typeof db;

export { schema };

/** True when running with the local SQLite file (no remote Turso). */
export const isLocalDb =
  !process.env.TURSO_DATABASE_URL ||
  process.env.TURSO_DATABASE_URL.startsWith('file:');

/** True when Google OAuth isn't configured — UI uses Credentials placeholder. */
export const isDemoAuth = !process.env.AUTH_GOOGLE_ID;

/**
 * @deprecated Use `isDemoAuth` for auth-related branches; the DB is now always
 * available, so "demo mode" no longer needs a single flag.
 */
export const isDemoMode = isDemoAuth;
