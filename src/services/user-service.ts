import { db } from "../db/connection";
import { users } from "../db/schema";

export interface RegisterUserPayload {
  name?: string;
  email?: string;
  password?: string;
}

export async function registerUser(payload: RegisterUserPayload) {
  const { name, email, password } = payload;

  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required");
  }

  // Hash password using Bun's built-in bcrypt hasher
  const hashedPassword = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  // Insert to MySQL database
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });
}
