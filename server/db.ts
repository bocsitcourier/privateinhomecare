import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool, { schema });

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

      console.error(`[DB] Operation failed (attempt ${i + 1}/${maxRetries + 1}):`, error.message);

      if (i === maxRetries) {
        throw error;
      }

      const isRetryableError = error.message?.includes('Connection terminated') ||
        error.message?.includes('connection error') ||
        error.message?.includes('timeout') ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT';

      if (!isRetryableError) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  throw lastError!;
}
