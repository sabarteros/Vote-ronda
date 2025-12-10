```markdown
# Simple File-Based Voting (Next.js)

Ringkas:
- Login hanya dengan nomor HP yang diizinkan.
- Tidak memakai DB; semua vote disimpan ke file `public/votes.json`.
- Allowed list dapat dikonfigurasi lewat environment variable `ALLOWED_PHONES` (recommended) atau fallback ke `public/allowed.json`.
- User hanya bisa vote sekali (server-side check based on cookie `phone`).
- Hasil publik tersedia di `/public`.
- Fireworks animasi muncul saat vote berhasil.
- Header background menggunakan `public/logo.png`.
- Bisa dijalankan lokal (`npm run dev`) dan dideploy ke Vercel.

Quick start (local):
1. Salin semua file proyek ini ke folder baru.
2. (Opsional) Buat `.env.local` untuk local testing:
   ALLOWED_PHONES=["081234567890","089876543210"]
3. Install dependencies:
   npm install
4. Jalankan dev server:
   npm run dev
5. Buka http://localhost:3000 — login dengan nomor yang ada di ALLOWED_PHONES atau public/allowed.json.

Deploy ke Vercel:
1. Push repo ke GitHub.
2. Di Vercel, buat project baru -> import repo.
3. (Optional but recommended) Set Environment Variable `ALLOWED_PHONES` in Vercel Settings (Production) with a JSON array or newline/comma-separated list.
4. Deploy.

Important notes about persistence on Vercel:
- This app writes votes to `public/votes.json` on the instance filesystem.
- Vercel serverless containers are ephemeral; writes may not persist across deployments or instance restarts.
- For persistent production storage, consider:
  - Commit-back to GitHub (requires PAT and implementation).
  - Use object storage (S3/GCS) or a DB.
- For demo / internal usage or running on a VM/VPS, current file-based approach works fine.

Security notes:
- Cookie is not HttpOnly because client reads `phone` for UI. If you want HttpOnly, adapt client to not read cookie and fetch identity from server.
```
