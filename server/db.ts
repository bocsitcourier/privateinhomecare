import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

const client = postgres(process.env.DATABASE_URL, { 
  prepare: false, // Required for Supabase transaction pooler
  ssl: 'require',
  max: 1, // Keep low for serverless/Replit environment
  connect_timeout: 10,
  idle_timeout: 20
});

export const db = drizzle(client, { schema });
