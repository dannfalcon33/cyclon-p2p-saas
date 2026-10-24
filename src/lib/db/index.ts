import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

// For build-time when DATABASE_URL is not yet configured, create a safe fallback client
const sql = neon(connectionString || "postgresql://mock:mock@localhost:5432/mock");

export const db = drizzle(sql, { schema });
