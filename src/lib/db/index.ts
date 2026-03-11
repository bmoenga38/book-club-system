import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DbInstance = NeonHttpDatabase<typeof schema>;

// Lazy initialization — prevents build failure when DATABASE_URL is not set.
// The connection is created on first use, not at module import time.
let _db: DbInstance | null = null;

export function getDb(): DbInstance {
  if (!_db) {
    const sql = neon(process.env.DATABASE_URL!);
    _db = drizzle({ client: sql, schema });
  }
  return _db;
}

// IMPORTANT: Proxy creates the connection lazily on first property access.
// This avoids calling neon() at module load time (which crashes builds without DATABASE_URL).
export const db = new Proxy({} as DbInstance, {
  get(_target, prop) {
    return getDb()[prop as keyof DbInstance];
  },
});
