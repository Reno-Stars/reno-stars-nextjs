import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Uses non-null assertion so schema-only commands (e.g. `drizzle-kit generate`)
    // don't throw at import time. The value is only needed for commands that
    // connect to the database (push, migrate, studio).
    url: process.env.DATABASE_URL!,
  },
});
