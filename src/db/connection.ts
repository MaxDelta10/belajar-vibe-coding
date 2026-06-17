import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const pool = mysql.createPool(
  process.env.DATABASE_URL || "mysql://root:@localhost:3306/belajar_vibe_coding"
);

export const db = drizzle({ client: pool });
