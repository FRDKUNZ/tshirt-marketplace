# Vercel Deployment Checklist

## Before Deployment ✅

- [ ] Push code to GitHub
- [ ] Supabase project is set up and running
- [ ] Google OAuth configured with production redirect URL
- [ ] Midtrans account configured (sandbox or production)
- [ ] All database migrations run
- [ ] Storage buckets created (`designs` and `previews`)
- [ ] `.env.local.example` reviewed for required variables

## Environment Variables (Add to Vercel)

Add these in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-midtrans-client-key
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

⚠️ **IMPORTANT:** Replace all placeholder values with your actual keys!

## Deployment Steps

### Quick Deploy (5 minutes):

1. Go to https://vercel.com
2. Login with GitHub
3. Click "Add New..." → "Project"
4. Import `tshirt-marketplace` repository
5. Click "Environment Variables" section
6. Add all 7 environment variables listed above
7. Click "Deploy"
8. Wait 2-5 minutes for build to complete
9. Your site is live! 🎉

### CLI Deploy (alternative):

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
vercel env add MIDTRANS_SERVER_KEY
vercel env add MIDTRANS_IS_PRODUCTION
vercel env add NEXT_PUBLIC_APP_URL

# Production deploy
vercel --prod
```

## Post-Deployment Configuration

- [ ] Update Supabase redirect URL: `https://your-app.vercel.app/auth/callback`
- [ ] Update Google OAuth redirect URI: `https://your-app.vercel.app/auth/callback`
- [ ] Configure Midtrans webhook: `https://your-app.vercel.app/api/webhook/payment`
- [ ] Make yourself admin via Supabase SQL:
  ```sql
  UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';
  ```

## Testing Checklist

After deployment, test these flows:

- [ ] Homepage loads successfully
- [ ] Google login works
- [ ] T-shirt customizer works (drag, resize, rotate)
- [ ] Add to cart works
- [ ] Checkout flow completes
- [ ] Payment via Midtrans works (use sandbox mode)
- [ ] Admin dashboard accessible (`/admin`)
- [ ] Dark mode toggle works
- [ ] Mobile responsive (test on phone or browser mobile view)
- [ ] Profile page shows order history

## Making Site Public

Your site is **public by default** on Vercel! To ensure anyone can access it:

1. Vercel Dashboard → Your Project → Settings
2. Ensure "Deployment Protection" is disabled or set to "No Protection"
3. No password protection enabled
4. `robots.txt` is in place (already added)

## Optional: Custom Domain

To use your own domain:

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `teecraft.com`)
3. Configure DNS as instructed (CNAME to `cname.vercel-dns.com`)
4. Wait for DNS propagation (15 min - 48 hours)
5. Set as primary domain

## Continuous Deployment

After linking GitHub repo, every push to `main` branch will:
- Automatically trigger new deployment
- Create preview URL for testing
- Deploy to production when on main branch

```bash
git add .
git commit -m "Update feature"
git push
# Vercel handles the rest automatically!
```

## Build Status

✅ **Local build successful!** Your code is ready for deployment.

Next.js build completed without errors:
- All pages compiled successfully
- All routes detected
- No TypeScript errors
- Production optimizations enabled

## Support Resources

- **DEPLOYMENT.md** - Full deployment guide (created in project)
- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/app/building-your-application/deploying

---

**Ready to deploy! 🚀**
