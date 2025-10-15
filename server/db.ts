import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,              // REQUIRED for pgBouncer
  ssl: { rejectUnauthorized: false } // Supabase requires TLS
  // or: ssl: 'require'
});

export const db = drizzle(client);