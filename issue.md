# Implementasi Unit Test untuk Seluruh API

## Deskripsi Tugas
Kita perlu memastikan stabilitas dan keandalan sistem dengan membuat *unit test* terotomatisasi untuk semua endpoint API yang tersedia. Pengujian harus mencakup skenario sukses maupun gagal pada tiap-tiap endpoint.

## Persyaratan Teknis
- **Test Framework**: Gunakan `bun test`.
- **Lokasi File**: Simpan seluruh berkas pengujian di dalam folder `tests/`.
- **Konsistensi State**: **WAJIB** membersihkan/menghapus data terkait dari database (tabel `users` dan `sessions`) setiap kali sebelum suatu skenario/suite dijalankan. Hal ini sangat penting agar tidak ada tumpang tindih data (*data clash*) antar skenario pengujian.

## Skenario Pengujian

Berikut adalah kerangka skenario yang harus Anda implementasikan dalam bentuk *unit test*. Bebas menggunakan struktur kode `describe` dan `it` yang menurut Anda rapi, asalkan mencakup poin-poin berikut:

### 1. API Registrasi User (`POST /api/users`)
- [ ] **Sukses**: Mendaftar dengan data valid (name, email, password sesuai kriteria).
- [ ] **Gagal**: Mendaftar menggunakan email yang sudah pernah terdaftar sebelumnya (duplikat).
- [ ] **Gagal**: Payload registrasi tidak lengkap (misal: password tidak disertakan).
- [ ] **Gagal (Validasi)**: Mengirimkan nama karakter terlalu panjang (> 100 karakter).
- [ ] **Gagal (Validasi)**: Mengirimkan format email yang tidak valid.
- [ ] **Gagal (Validasi)**: Mengirimkan password yang terlalu pendek (< 6 karakter).

### 2. API Login User (`POST /api/users/login`)
- [ ] **Sukses**: Login menggunakan kombinasi email dan password yang benar (harus merespons dengan data *token*).
- [ ] **Gagal**: Login dengan akun email yang tidak ada di database.
- [ ] **Gagal**: Login dengan password yang keliru.
- [ ] **Gagal**: Payload login kosong atau tidak lengkap.

### 3. API Dapatkan Profil Pengguna (`POST /api/users/current-user`)
- [ ] **Sukses**: Request dikirimkan dengan *header* `Authorization` yang berisi token valid (mengembalikan data profil user).
- [ ] **Gagal**: Request tidak menyertakan *header* `Authorization` sama sekali.
- [ ] **Gagal**: Request menggunakan token yang asal/tidak valid/sudah dihapus dari database.

### 4. API Logout User (`DELETE /api/users/logout`)
- [ ] **Sukses**: Melakukan logout dengan menyertakan token yang valid di *header*. (Pastikan sesi tersebut hilang dari database).
- [ ] **Sukses (Idempotent)**: Memanggil endpoint logout secara berturut-turut untuk token yang sama. Request kedua harus tetap merespons status OK (200) tanpa terjadi error internal.
- [ ] **Gagal**: Tidak mengirimkan *header* otorisasi sama sekali.

---

**Catatan Tambahan untuk Junior/Implementator:**
Detail implementasi kode tes seperti fungsi *mocking*, manipulasi langsung melalui ORM untuk setup data awal, atau fungsi koneksi http (misalnya menggunakan fungsi `fetch` lokal) diserahkan sepenuhnya kepada Anda. Foku utama adalah semua *checklist* skenario di atas berhasil hijau (*pass*).
