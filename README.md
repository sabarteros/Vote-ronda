Di Vercel: Settings → Environment Variables → tambahkan ALLOWED_PHONES dengan nilai JSON array atau newline/comma-separated string. Contoh (paling aman):
Name: ALLOWED_PHONES
Value: ["081234567890","089876543210"]
Environment: Production (atau sesuai kebutuhan)
Setelah menyimpan env var, redeploy project.
Jangan menaruh nomor nyata di public/allowed.json — hapus file itu dari public jika masih ada.
Kenapa ini aman:

Environment variables di Vercel tidak diekspos ke public runtime UI. Hanya anggota project dengan akses dapat melihatnya di Vercel dashboard.
data/allowed.json berada di root (bukan public) sehingga Next.js tidak menyajikannya sebagai static asset; hanya server-side code (API) yang dapat membacanya.
Kode tidak mengekspose daftar allowed melalui API/halaman publik — getAllowedPhones hanya dipanggil server-side (pages/api/login.js) dan hanya mengembalikan success/failed kepada client setelah pengecekan.
Langkah eksekusi singkat untuk Anda sekarang:

Hapus file public/allowed.json (atau kosongkan) dari project.
Tambahkan file lib/allowed.js seperti di atas.
(Untuk testing lokal) tambahkan data/allowed.json di root (atau set .env.local).
Pastikan .gitignore berisi /data/allowed.json.
Commit & push.
Di Vercel: set ALLOWED_PHONES (recommended) lalu redeploy.
Kalau Anda ingin, saya bisa:

Menghapus referensi public/allowed.json di proyek yang saya kirim sebelumnya dan meng-generate patch commit yang bisa Anda apply; atau
Langsung menambahkan script kecil untuk mem-validasi env var ALLOWED_PHONES di build-time dan mem-fail build jika tidak ada (opsional, mencegah misconfig).
