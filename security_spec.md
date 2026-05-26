# Security Specification for Penyembelihan Rumah Qurban Arafah 2026

## 1. Data Invariants
- Setiap data `pekurban` wajib memiliki properti `id` (format string alfanumerik), `namaPekurban`, `jenisHewan` (enum terbatas), dan `status`.
- Perubahan status wajib mengikuti alur berurutan (State Machine) atau hanya dapat dimodifikasi oleh Admin.
- Kolom keamanan penting seperti `id` dan `createdAt` bersifat immutable (tidak boleh diubah setelah dibuat).
- Pengguna umum (publik) hanya boleh melakukan operasi `get` (baca satu data) atau `list` jika mereka memasukkan filter identifikasi seperti data miliknya sendiri (nomor telepon / ID). Publik dilarang melakukan `write` (create, update, delete).
- Hanya admin terverifikasi (authenticated admin) yang dapat melakukan seluruh operasi CRUD.

---

## 2. The "Dirty Dozen" Payloads (Athentication & Integrity Violations)
Berikut adalah 12 jenis muatan (payload) tidak sah yang akan diblokir oleh keamanan aturan Firestore (`PERMISSION_DENIED`):

1. **Identity Spoofing**: Mencoba menulis data pekurban dengan data `id` yang diubah-ubah di client.
2. **Unauthorized Creation**: Pengguna anonim/umum (tanpa login admin) mencoba membuat catatan pekurban baru.
3. **Privilege Escalation**: User mengubah field role dirinya menjadi Admin atau mengubah filter data penting.
4. **Invalid Enum Poisoning**: Menyimpan data hewan dengan jenis hewan "Naga" atau "Kucing" (di luar enum Sapi/Kambing/Domba/Kerbau).
5. **No-Size Shell Payload**: Menyimpan string `namaPekurban` dengan teks kosong atau raksasa (ukuran > 10MB) untuk menguras penyimpanan.
6. **Chronological Forgery**: Memalsukan timestamp `createdAt` di client menggunakan tanggal masa lalu, bukan `request.time`.
7. **Bypassing State Progression**: Merubah status qurban secara sepihak langsung ke "selesai" tanpa melewati penerimaan.
8. **Malicious Path Traversal**: Menciptakan dokumen dengan ID yang mengandung karakter aneh `../` untuk merusak urutan database.
9. **Tampering with Immortal Field**: Mengedit kolom `createdAt` yang sudah tersimpan sebelumnya.
10. **Public Mass Scraping**: Melakukan pembacaan massal tanpa query filter, yang dapat bocorkan data pribadi ponsel pekurban lain.
11. **Malicious Update Injection**: Mengirimkan field bayangan (ghost field) seperti `isVerifiedAdmin: true` pada update biasa.
12. **Unauthorized Deletion**: Pengguna publik mencoba menghapus data pekurban terdaftar.

---

## 3. Test Runner Specification
Konfigurasi pengujian keamanan Firestore akan diload via file `DRAFT_firestore.rules` dan diaplikasikan ke `firestore.rules`. Operator admin diidentifikasi secara khusus melalui email penanggung jawab platform `rumahqurbanarofah@gmail.com`.
Semua payload di atas diuji secara langsung untuk menjamin return `PERMISSION_DENIED` bagi pihak tidak berwenang.
