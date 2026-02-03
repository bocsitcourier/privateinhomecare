import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

const client = postgres(process.env.DATABASE_URL, {
  prepare: false,              // REQUIRED for pgBouncer/Supabase transaction pooler
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }, // Smart: off for localhost, TLS for prod
  max: 10,                     // Maximum number of connections (production-ready)
  idle_timeout: 20,            // Idle timeout in seconds
  connect_timeout: 10,         // Connection timeout in seconds
  onnotice: () => { },          // Disable notices to reduce noise
  transform: {
    undefined: null            // Transform undefined to null for PostgreSQL
  }
});

export const db = drizzle(client, { schema });

// Helper function to handle database operations with retry logic
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Log the error
      console.error(`[DB] Operation failed (attempt ${i + 1}/${maxRetries + 1}):`, error.message);

      // If this is the last attempt, throw the error
      if (i === maxRetries) {
        throw error;
      }

      // Check if it's a connection error that we should retry
      const isRetryableError = error.message?.includes('Connection terminated') ||
        error.message?.includes('connection error') ||
        error.message?.includes('timeout') ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT';

      if (!isRetryableError) {
        throw error; // Don't retry non-connection errors
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  throw lastError!;
}
