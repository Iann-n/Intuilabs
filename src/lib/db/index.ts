// src/db/index.ts

// ORM means: Object Relational Mapper
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// This prevents Next.js from creating a million idle connections during hot-reloading
// process.env.DATABASE_URL! is called: non-null assertion
// You're telling TypeScript: Trust me. DATABASE_URL exists.
const connectionString = process.env.DATABASE_URL!;

// We use the 'postgres' driver - translates code to network protocol required for postgresSQL database
// Prepared statements can cause weird issues with: Vercel, Hot Reloading, Serverless functions so most examples set prepare: false
const client = postgres(connectionString, { prepare: false });

// Export the db as a drizzle instance so we can use it anywhere in our Next.js app
export const db = drizzle(client, { schema });