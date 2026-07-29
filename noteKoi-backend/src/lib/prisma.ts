import "../../src/config/index.js"; // ensure dotenv is loaded
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/index.js";
import { env } from "../config/index.js";

// pg Pool is imported lazily so this module can be tree-shaken in tests
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);

// Singleton Prisma client — shared across the entire process lifetime.
// Using the PG driver adapter (Prisma v7 requirement).
const prisma = new PrismaClient({ adapter });

export default prisma;
