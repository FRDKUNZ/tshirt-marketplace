# Deploy to Vercel - Complete Guide

This guide will help you deploy your TeeCraft t-shirt marketplace to Vercel so it can be accessed by anyone on the internet.

## Prerequisites Checklist

Before deploying, ensure you have:

- [ ] GitHub account with your code pushed
- [ ] Vercel account (free tier is enough)
- [ ] Supabase project set up and running
- [ ] Midtrans account (sandbox for testing)
- [ ] Google OAuth credentials configured

---

## Step 1: Push Code to GitHub

If you haven't already pushed your code:

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: TeeCraft marketplace"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/tshirt-marketplace.git
git branch -M main
git push -u origin main
```

---

## Step 2: Prepare External Services

### 2.1 Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create/login to your project
2. **Enable Google OAuth:**
   - Go to Authentication → Providers → Google
   - Add your Google OAuth credentials (Client ID & Secret)
   - Add redirect URLs:
     - `http://localhost:3000/auth/callback` (for local dev)
     - `https://your-project-name.vercel.app/auth/callback` (for production - you'll get this URL after deployment)

3. **Run Database Migration:**
   - Go to SQL Editor
   - Copy contents from `supabase/migrations/001_initial_schema.sql`
   - Run the SQL script

4. **Create Storage Buckets:**
   - Go to Storage → Create Bucket
   - Create `designs` bucket (set to **private**)
   - Create `previews` bucket (set to **public**)

5. **Get Your Keys:**
   - Go to Project Settings → API
   - Copy these values:
     - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### 2.2 Midtrans Setup

1. Go to [midtrans.com](https://midtrans.com) and create/login to your account
2. Go to Dashboard → Settings → Access Keys
3. Copy these values:
   - `Client Key` → `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`
   - `Server Key` → `MIDTRANS_SERVER_KEY` (keep this secret!)
4. Set `MIDTRANS_IS_PRODUCTION=false` for testing (sandbox mode)

### 2.3 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project (or use existing one)
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - **Authorized redirect URIs:**
     - `http://localhost:3000/auth/callback`
     - `https://your-project-name.vercel.app/auth/callback` (add your Vercel URL after deployment)
5. Copy Client ID and Client Secret to Supabase (Step 2.1)

---

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com) and login**

2. **Click "Add New..." → "Project"**

3. **Import your GitHub repository:**
   - Search for `tshirt-marketplace`
   - Click "Import"

4. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

5. **Add Environment Variables:**
   Click "Environment Variables" and add:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-midtrans-client-key
   MIDTRANS_SERVER_KEY=your-midtrans-server-key
   MIDTRANS_IS_PRODUCTION=false
   NEXT_PUBLIC_APP_URL=https://your-project-name.vercel.app
   ```

   > **Important:** Replace all placeholder values with your actual keys from Step 2!

6. **Click "Deploy"**

7. **Wait for build** (usually 2-5 minutes)

8. **Your site is now live!** 🎉
   - URL: `https://your-project-name.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: (press enter or type custom name)
# - Directory: ./ (press enter)

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
vercel env add MIDTRANS_SERVER_KEY
vercel env add MIDTRANS_IS_PRODUCTION
vercel env add NEXT_PUBLIC_APP_URL

# Deploy to production
vercel --prod
```

---

## Step 4: Post-Deployment Configuration

### 4.1 Update Supabase Redirect URLs

After deployment, you'll get your Vercel URL (e.g., `https://teecraft.vercel.app`):

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your production redirect URL:
   - `https://your-project-name.vercel.app/auth/callback`

### 4.2 Update Google OAuth Redirect URIs

1. Go to Google Cloud Console → APIs & Services → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add authorized redirect URI:
   - `https://your-project-name.vercel.app/auth/callback`

### 4.3 Configure Midtrans Webhook

For automatic payment status updates:

1. Go to Midtrans Dashboard → Settings → Configuration
2. Set Payment Notification URL:
   ```
   https://your-project-name.vercel.app/api/webhook/payment
   ```
3. Save configuration

### 4.4 Make Yourself an Admin

After first login on production:

1. Go to Supabase SQL Editor
2. Run this query:

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

---

## Step 5: Test Your Deployment

### Must-Test Checklist:

- [ ] **Homepage loads** - Visit your Vercel URL
- [ ] **Google login works** - Click "Login with Google"
- [ ] **T-shirt customizer works** - Go to `/customize`
- [ ] **Cart works** - Add items to cart
- [ ] **Checkout works** - Complete checkout flow
- [ ] **Payment works** - Use Midtrans sandbox payment
- [ ] **Admin dashboard accessible** - Login as admin, go to `/admin`
- [ ] **Dark mode works** - Toggle dark mode
- [ ] **Mobile responsive** - Test on phone or browser mobile view

---

## Step 6: Custom Domain (Optional)

To use your own domain (e.g., `teecraft.com`):

1. **Go to Vercel Dashboard → Your Project → Settings → Domains**

2. **Add your domain:**
   - Enter `teecraft.com` (or your domain)
   - Click "Add"

3. **Configure DNS:**
   Vercel will show you DNS records to add. For most domain providers:
   
   - **Type:** `CNAME`
   - **Name:** `www` or `@`
   - **Value:** `cname.vercel-dns.com`

4. **Wait for DNS propagation** (usually 15 minutes to 48 hours)

5. **Set as primary domain** in Vercel settings

### Popular Domain Registrars:
- [Namecheap](https://namecheap.com) (affordable)
- [Google Domains](https://domains.google)
- [Cloudflare Registrar](https://cloudflare.com/products/registrar)

---

## Step 7: Make It Publicly Accessible

Your Vercel deployment is **already public by default**! Anyone with the URL can access it.

### To ensure public access:

1. **No authentication on Vercel:**
   - Vercel dashboard → Your Project → Settings
   - Make sure "Deployment Protection" is **disabled** or set to "No Protection"

2. **Search engine indexing (optional):**
   - Add a `robots.txt` file to `public/` folder:

```txt
# public/robots.txt
User-agent: *
Allow: /

Sitemap: https://your-domain.com/sitemap.xml
```

3. **No password protection:**
   - Don't enable Vercel Password Protection unless you want to restrict access

---

## Troubleshooting

### Build Fails

**Error:** `Module not found`
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Error:** Environment variables not found
- Check all env vars are added in Vercel Dashboard → Settings → Environment Variables
- Redeploy after adding env vars

### Runtime Errors

**Error:** Supabase connection failed
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase project is active

**Error:** Google OAuth fails
- Verify redirect URI matches exactly (including `https://` and `/auth/callback`)
- Check Google OAuth credentials in Supabase are correct

**Error:** Midtrans payment fails
- Verify `MIDTRANS_SERVER_KEY` is correct (not Client Key)
- Check `MIDTRANS_IS_PRODUCTION=false` for sandbox

### View Deployment Logs

```bash
# View build logs
vercel logs <your-deployment-url>

# View runtime logs
vercel logs <your-deployment-url> --type=runtime
```

Or in Vercel Dashboard:
- Your Project → Deployments → Click deployment → View logs

---

## Environment Variables Reference

| Variable | Where to Get | Required | Secret |
|----------|-------------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API | ✅ | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | ✅ | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API | ✅ | **Yes** |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Midtrans Dashboard → Settings → Access Keys | ✅ | No |
| `MIDTRANS_SERVER_KEY` | Midtrans Dashboard → Settings → Access Keys | ✅ | **Yes** |
| `MIDTRANS_IS_PRODUCTION` | Set manually (`false` for testing) | ✅ | No |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL | ✅ | No |

> **⚠️ IMPORTANT:** Never commit `.env.local` or expose secret keys! The `.gitignore` already protects these files.

---

## Continuous Deployment

After initial setup, **every push to main branch** on GitHub will automatically:

1. Trigger a new Vercel deployment
2. Create a preview URL (for testing before going live)
3. Auto-deploy to production when merged to main

### Workflow:

```bash
# Make changes
git add .
git commit -m "Update homepage"
git push

# Vercel will automatically:
# 1. Build your project
# 2. Create preview deployment
# 3. Deploy to production (if on main branch)
```

---

## Monitoring & Analytics

After deployment, monitor your app:

1. **Vercel Analytics** (free tier available):
   - Dashboard → Your Project → Analytics
   - Track page views, performance metrics

2. **Vercel Speed Insights:**
   - Add to your root layout:
   ```tsx
   import { SpeedInsights } from "@vercel/speed-insights/next"
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>{children}</body>
         <SpeedInsights />
       </html>
     )
   }
   ```

3. **Error Monitoring:**
   - View errors in Vercel Dashboard → Logs
   - Set up email notifications for failures

---

## Next Steps After Deployment

1. ✅ Share your live URL with users
2. ✅ Test all user flows end-to-end
3. ✅ Set up Midtrans to production mode when ready
4. ✅ Add custom domain (optional)
5. ✅ Enable analytics
6. ✅ Set up monitoring and alerts
7. ✅ Create admin user for order management

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Midtrans Docs:** https://docs.midtrans.com
- **Next.js Docs:** https://nextjs.org/docs

**Your marketplace is now ready for the world! 🚀**
