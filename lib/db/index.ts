import * as schema from './schema';

/**
 * Get and validate the database URL from environment variables.
 * @throws Error if DATABASE_URL is not set
 */
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is required. ' +
        'Please set it in your .env file or environment.'
    );
  }
  return url;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DrizzleDB = any;

function createDrizzleInstance(): DrizzleDB {
  const url = getDatabaseUrl();

  if (url.includes('neon.tech')) {
    // Serverless Neon driver for production / preview
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { neon } = require('@neondatabase/serverless');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require('drizzle-orm/neon-http');
    const sql = neon(url);
    return drizzle(sql, { schema });
  } else {
    // Standard pg Pool for local development
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pg = require('pg');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require('drizzle-orm/node-postgres');
    const pool = new pg.Pool({ connectionString: url });
    return drizzle(pool, { schema });
  }
}

// Lazy-initialized database client.
// Only connects when first query is made, not at module import time.
let _db: DrizzleDB | null = null;

/**
 * Gets the database instance, initializing it lazily on first access.
 * This prevents crashes when importing this module in contexts
 * where DATABASE_URL is not needed (e.g., build-time imports).
 *
 * Supports both Neon (serverless) and local PostgreSQL (pg Pool).
 * Detection is based on whether DATABASE_URL contains "neon.tech".
 */
export const db = new Proxy({} as DrizzleDB, {
  get(_target, prop, receiver) {
    if (!_db) {
      _db = createDrizzleInstance();
    }
    return Reflect.get(_db, prop, receiver);
  },
});

// Re-export schema for convenience
export * from './schema';
