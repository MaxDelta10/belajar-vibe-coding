# Belajar Vibe Coding (Backend API)

Proyek ini adalah implementasi sistem backend modern yang menyediakan fitur autentikasi (Registrasi, Login, Autorisasi, Logout) dengan pendekatan Vibe Coding. Aplikasi ini dirancang untuk memiliki performa yang tinggi, mudah dikembangkan, serta mengikuti praktik (*best practices*) struktur kode yang rapi.

## 🚀 Technology Stack
- **Runtime**: [Bun](https://bun.sh/) (Fast JavaScript/TypeScript runtime)
- **Framework Web**: [ElysiaJS](https://elysiajs.com/) (Web framework tercepat untuk Bun)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: MySQL

## 📦 Library Utama yang Digunakan
- `elysia`: Web framework inti.
- `drizzle-orm` & `mysql2`: Untuk interaksi dan koneksi database MySQL secara _type-safe_.
- `drizzle-kit`: Utilitas untuk menghasilkan (generate) dan mendorong (push) migrasi skema database.
- `bun:test`: Framework unit test bawaan dari Bun.
- *(Built-in)*: `Bun.password` untuk enkripsi password (bcrypt), TypeBox (tersedia secara bawaan di Elysia) untuk validasi skema.

## 📂 Arsitektur dan Struktur File

Proyek ini dipisahkan berdasarkan fokus fungsional (*Separation of Concerns*). 
Penamaan file menggunakan format **kebab-case** (misal: `users-route.ts`, `user-service.ts`).

```text
📦 belajar-vibe-coding
 ┣ 📂 drizzle                  # Menyimpan file hasil generate migrasi database Drizzle
 ┣ 📂 src
 ┃ ┣ 📂 db
 ┃ ┃ ┣ 📜 connection.ts        # Setup koneksi database ke MySQL
 ┃ ┃ ┗ 📜 schema.ts            # Deklarasi skema/tabel database Drizzle
 ┃ ┣ 📂 routes
 ┃ ┃ ┗ 📜 users-route.ts       # Definisi endpoint (REST API) & validasi skema (TypeBox)
 ┃ ┣ 📂 services
 ┃ ┃ ┗ 📜 user-service.ts      # Logika bisnis inti (Registrasi, Login, dsb)
 ┃ ┣ 📜 app.ts                 # Instansiasi & konfigurasi ElysiaJS utama
 ┃ ┗ 📜 index.ts               # Entry point aplikasi (menjalankan server)
 ┣ 📂 tests
 ┃ ┗ 📜 user.test.ts           # Skenario Unit Testing untuk keseluruhan API
 ┣ 📜 .env                     # Environment variables (Database URL)
 ┣ 📜 package.json             # Dependensi dan scripts
 ┗ 📜 README.md
```

## 🗄️ Schema Database

Terdapat 2 tabel utama yang dikelola menggunakan Drizzle ORM:

1. **`users`**
   - `id` (serial, Primary Key)
   - `name` (varchar 255, Not Null)
   - `email` (varchar 255, Not Null, Unique)
   - `password` (varchar 255, Not Null) - *Hashed dengan bcrypt*
   - `created_at` (timestamp, default now)

2. **`sessions`**
   - `id` (serial, Primary Key)
   - `token` (varchar 255, Not Null)
   - `user_id` (bigint, Not Null, Foreign Key -> `users.id`)
   - `created_at` (timestamp, default now)

## 🌐 API yang Tersedia

Base URL: `http://localhost:3000/api`

| Method   | Endpoint                | Deskripsi                                 | Body Request / Headers                       |
|----------|-------------------------|-------------------------------------------|----------------------------------------------|
| `POST`   | `/users`                | Registrasi akun user baru                 | JSON: `{ name, email, password }`            |
| `POST`   | `/users/login`          | Login & menghasilkan _Session Token_      | JSON: `{ email, password }`                  |
| `POST`   | `/users/current-user`   | Mengambil data profil user saat ini       | Header: `Authorization: Bearer <token>`      |
| `DELETE` | `/users/logout`         | Menghapus sesi user (Logout)              | Header: `Authorization: Bearer <token>`      |

> **Catatan Validasi:** Endpoint `/users` (Registrasi) telah dilengkapi validasi otomatis, antara lain `name` maksimal 100 karakter, format `email` wajib valid, dan panjang `password` minimal 6 karakter.

## ⚙️ Cara Setup Project

1. **Clone repository ini**
   ```bash
   git clone <repo-url>
   cd belajar-vibe-coding
   ```
2. **Install dependensi**
   ```bash
   bun install
   ```
3. **Konfigurasi Environment**
   Buat file `.env` di root direktori dengan format berikut:
   ```env
   DATABASE_URL="mysql://<user>:<password>@<host>:<port>/<nama_database>"
   # Contoh: DATABASE_URL="mysql://root:@localhost:3306/belajar_vibe_coding"
   ```
4. **Push Schema Database**
   Pastikan MySQL sudah berjalan dan jalankan perintah Drizzle untuk menyesuaikan skema DB Anda:
   ```bash
   bun run db:push
   ```

## 🏃‍♂️ Cara Menjalankan Aplikasi

Jalankan server dalam mode pengembangan (*watch mode*):
```bash
bun run dev
```
Server akan berjalan secara default di `http://localhost:3000`.

## 🧪 Cara Test Aplikasi

Seluruh skenario pengujian (sukses & gagal) telah dibuat komprehensif menggunakan `bun test` dengan *in-memory handler*. Skrip pengujian akan otomatis membersihkan tabel setiap memulai iterasi untuk menjaga konsistensi state.

Untuk menjalankan Unit Test:
```bash
bun test
```
