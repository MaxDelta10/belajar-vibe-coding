import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { users, sessions } from "../db/schema";

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

export interface LoginUserPayload {
  email?: string;
  password?: string;
}

export async function loginUser(payload: LoginUserPayload) {
  const { email, password } = payload;

  if (!email || !password) {
    throw new Error("Email dan password harus diisi");
  }

  // Find user by email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw new Error("Email atau password salah");
  }

  // Verify password using Bun's native bcrypt verify
  const isPasswordCorrect = await Bun.password.verify(password, user.password);
  if (!isPasswordCorrect) {
    throw new Error("Email atau password salah");
  }

  // Generate UUID token
  const token = crypto.randomUUID();

  // Save session token to DB
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  return token;
}

export async function getCurrentUser(token: string | undefined) {
  if (!token) {
    throw new Error("Unauthorized");
  }

  const [result] = await db
    .select({
      token: sessions.token,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);

  if (!result) {
    throw new Error("Unauthorized");
  }

  return {
    token: result.token,
    name: result.name,
    email: result.email,
    created_at: result.createdAt,
  };
}

export async function logoutUser(token: string | undefined) {
  if (!token) {
    throw new Error("Unauthorized");
  }

  // Delete session from DB directly (idempotent)
  await db.delete(sessions).where(eq(sessions.token, token));
}
