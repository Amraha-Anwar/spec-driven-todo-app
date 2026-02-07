import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const auth = betterAuth({
  database: pool,
  
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password: string) => {
        return bcrypt.hash(password, 10);
      },
      verify: async ({ password, hash }: { password: string; hash: string }) => {
        return bcrypt.compare(password, hash);
      },
    },
  },
  
  secret: process.env.BETTER_AUTH_SECRET,
  
  plugins: [
    nextCookies(),
  ],
});