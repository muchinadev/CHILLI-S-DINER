import { Pool } from "pg";

declare global {
  var __pgPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // Hosted Postgres (Supabase included) requires SSL; local dev Postgres
  // doesn't speak it at all, so only turn it on for non-local hosts.
  const isLocalHost = /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString);

  return new Pool({
    connectionString,
    ssl: isLocalHost ? undefined : { rejectUnauthorized: false },
  });
}

// Reuse the pool across hot reloads in dev instead of leaking connections.
export const pool = globalThis.__pgPool ?? createPool();
if (process.env.NODE_ENV !== "production") {
  globalThis.__pgPool = pool;
}

export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params?: unknown[],
) {
  const result = await pool.query<T>(text, params);
  return result;
}
