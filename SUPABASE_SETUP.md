# 🔧 Setup Supabase untuk Production (Vercel)

## Masalah: Login Google Redirect ke localhost

Setelah deploy ke Vercel, saat login dengan Google, Anda akan di-redirect ke **localhost** bukan ke **URL Vercel**.

**Penyebab:** Supabase belum dikonfigurasi untuk URL production Anda.

---

## ✅ Solusi: Update Supabase Settings

### Step 1: Dapatkan URL Vercel Anda

1. Buka Vercel Dashboard
2. Pilih project Anda
3. Copy URL deployment, contoh: `https://teecraft.vercel.app`

### Step 2: Update Supabase Site URL

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Go to **Authentication** → **URL Configuration**
4. Update **Site URL** menjadi:
   ```
   https://teecraft.vercel.app
   ```
   (ganti dengan URL Vercel Anda)

### Step 3: Tambah Redirect URLs

Di halaman yang sama (Authentication → URL Configuration):

**Tambahkan redirect URLs:**

```
https://teecraft.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

> **Penting:** Tambah KEDUA URL ini agar login bekerja di local development DAN production!

### Step 4: Verify Google OAuth Settings

1. Di Supabase, go to **Authentication** → **Providers** → **Google**
2. Pastikan:
   - ✅ **Enabled** toggle is ON
   - ✅ **Client ID** sudah diisi (dari Google Cloud Console)
   - ✅ **Client Secret** sudah diisi (dari Google Cloud Console)

### Step 5: Update Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit OAuth 2.0 Client ID yang Anda pakai
3. Di bagian **Authorized redirect URIs**, tambah:

```
https://teecraft.vercel.app/auth/callback
```

(Selain yang localhost sudah ada)

---

## 🚀 Fix Sudah Diterapkan di Code

File `src/app/auth/login/page.tsx` sudah diupdate untuk:

**Sebelum:**
```typescript
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
```

**Sesudah:**
```typescript
// Use current window location origin for production URL
// This automatically uses the correct URL (localhost or vercel)
const appUrl = window.location.origin
```

**Keuntungan:**
- ✅ Otomatis detect URL dari browser (localhost atau Vercel)
- ✅ Tidak perlu set `NEXT_PUBLIC_APP_URL` lagi
- ✅ Tidak akan salah redirect lagi

---

## 🧪 Testing Setelah Update

### 1. Commit dan Push Perubahan

```bash
git add .
git commit -m "fix: use dynamic URL for OAuth callback"
git push origin main
```

### 2. Tunggu Vercel Auto-Deploy

Vercel akan otomatis build dan deploy (2-5 menit)

### 3. Test Login Flow

1. Buka website production Anda: `https://teecraft.vercel.app`
2. Klik **Login** → **Continue with Google**
3. Pilih akun Google
4. **Perhatikan URL di browser** - harus redirect ke:
   ```
   https://teecraft.vercel.app/auth/callback?code=...
   ```
   
   ✅ **BENAR** - redirect ke URL Vercel  
   ❌ **SALAH** - redirect ke `http://localhost:3000`

5. Setelah login, harus redirect ke `/profile`
6. User info harus muncul (email, name)

---

## 🔍 Troubleshooting

### Masalah: Masih redirect ke localhost

**Kemungkinan penyebab:**

1. **Supabase Site URL belum diupdate**
   - Solution: Ikuti Step 2 di atas
   
2. **Redirect URL di Supabase belum ditambah**
   - Solution: Ikuti Step 3 di atas
   
3. **Google Cloud Console belum update redirect URI**
   - Solution: Ikuti Step 5 di atas

4. **Browser cache**
   - Solution: Hard refresh (`Ctrl+Shift+R` di Windows, `Cmd+Shift+R` di Mac)
   - Atau buka di Incognito/Private mode

### Masalah: Error "redirect_uri_mismatch"

**Penyebab:** Redirect URL di Google Cloud Console tidak match dengan yang dipanggil Supabase

**Solution:**
1. Check exact error URL di browser address bar
2. Copy URL tersebut (sampai `/auth/callback`)
3. Tambah ke Google Cloud Console → Authorized redirect URIs
4. Tunggu 5-10 menit untuk propagation
5. Coba lagi

### Masalah: Error "OAuth client not authorized"

**Penyebab:** Client ID di Supabase salah atau belum enabled

**Solution:**
1. Supabase → Authentication → Providers → Google
2. Verify Client ID dan Secret benar
3. Toggle OFF lalu ON kembali
4. Coba lagi

---

## 📋 Checklist Lengkap

Sebelum production login, pastikan semua ini sudah benar:

- [ ] Code sudah di-update (gunakan `window.location.origin`)
- [ ] Code sudah di-push ke GitHub
- [ ] Vercel sudah auto-deploy
- [ ] Supabase Site URL = `https://teecraft.vercel.app`
- [ ] Supabase Redirect URLs termasuk production URL
- [ ] Google Cloud Console redirect URI termasuk production URL
- [ ] Environment variables sudah di-set di Vercel
- [ ] Test login di production berhasil

---

## 🎯 Ringkasan Cepat

**Yang HARUS dilakukan di Supabase Dashboard:**

```
Authentication → URL Configuration:

✅ Site URL: https://teecraft.vercel.app

✅ Redirect URLs:
   - https://teecraft.vercel.app/auth/callback
   - http://localhost:3000/auth/callback
```

**Yang HARUS dilakukan di Google Cloud Console:**

```
OAuth 2.0 Client ID → Authorized redirect URIs:

✅ https://teecraft.vercel.app/auth/callback
✅ http://localhost:3000/auth/callback
```

**Setelah itu:**
- Push code → Vercel auto-deploy → Test login ✅

---

## 💡 Tips

1. **Selalu tambah kedua URL** (localhost + production) agar bisa development sekaligus production
   
2. **Incognito mode untuk testing** - menghindari masalah cache

3. **Check browser console** (`F12`) untuk melihat log callback URL - akan terlihat:
   ```
   Callback URL: https://teecraft.vercel.app/auth/callback
   ```

4. **Supabase logs** - di Supabase Dashboard → Logs → Auth logs untuk debug error

---

Setelah semua setup benar, login Google akan bekerja sempurna di production! 🎉
