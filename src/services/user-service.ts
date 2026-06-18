import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { users, sessions } from "../db/schema";

export interface RegisterUserPayload {
  name?: string;
  email?: string;
  password?: string;
}

/**
 * Mendaftarkan pengguna baru ke dalam sistem.
 * Fungsi ini akan melakukan hashing pada password menggunakan bcrypt (bawaan Bun) 
 * dan menyimpan data nama, email, serta password yang telah di-hash ke dalam tabel `users`.
 * 
 * @param payload Data registrasi yang berisi name, email, dan password.
 * @throws Error jika terdapat field yang kosong.
 */
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

/**
 * Memproses autentikasi pengguna untuk login.
 * Fungsi ini akan mencari pengguna berdasarkan email di database, 
 * memverifikasi kecocokan password menggunakan bcrypt, dan jika berhasil, 
 * akan membuat token sesi unik (UUID) lalu menyimpannya ke tabel `sessions`.
 * 
 * @param payload Data login yang berisi email dan password.
 * @returns Token sesi (UUID) sebagai string.
 * @throws Error jika email/password kosong, email tidak ditemukan, atau password salah.
 */
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

/**
 * Mengambil data profil pengguna yang sedang login (Current User) berdasarkan token sesi.
 * Fungsi ini akan melakukan query join antara tabel `sessions` dan `users` 
 * untuk mengembalikan informasi detail pengguna jika token valid.
 * 
 * @param token Token sesi otorisasi milik pengguna.
 * @returns Objek profil pengguna yang mencakup token, nama, email, dan waktu registrasi.
 * @throws Error ("Unauthorized") jika token tidak dikirim atau sesi tidak ditemukan.
 */
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

/**
 * Menghapus sesi pengguna dari sistem (Logout).
 * Fungsi ini bersifat idempotent, artinya akan mengeksekusi penghapusan baris 
 * data secara langsung dari tabel `sessions` berdasarkan token yang diberikan.
 * 
 * @param token Token sesi yang ingin dihapus/dibatalkan.
 * @throws Error ("Unauthorized") jika parameter token kosong.
 */
export async function logoutUser(token: string | undefined) {
  if (!token) {
    throw new Error("Unauthorized");
  }

  // Delete session from DB directly (idempotent)
  await db.delete(sessions).where(eq(sessions.token, token));
}
