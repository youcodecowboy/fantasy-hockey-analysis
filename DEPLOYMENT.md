# Deployment Guide

## Deploy to Vercel

### Step 1: Push to GitHub

1. Create a new repository on GitHub (don't initialize with README)
2. Run these commands:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"

### Step 3: Configure Environment Variables

After deployment, go to Project Settings → Environment Variables and add:

```env
# Convex (get from your .env.local or Convex dashboard)
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Yahoo OAuth (you'll get these after creating Yahoo app)
YAHOO_CLIENT_ID=your_yahoo_client_id
YAHOO_CLIENT_SECRET=your_yahoo_client_secret
NEXT_PUBLIC_YAHOO_REDIRECT_URI=https://your-app-name.vercel.app/api/yahoo/callback

# Together.ai
TOGETHER_API_KEY=your_together_api_key

# Convex Auth
CONVEX_AUTH_APPLICATION_ID=default
```

**Important**: After adding environment variables, redeploy your app (Vercel will prompt you).

### Step 4: Get Your Production URL

After deployment, Vercel will give you a URL like:
- `https://your-app-name.vercel.app`

### Step 5: Set Up Yahoo OAuth

1. Go to [Yahoo Developer Network](https://developer.yahoo.com/apps/create/)
2. Create a new application
3. Set redirect URI to: `https://your-app-name.vercel.app/api/yahoo/callback`
4. Copy Client ID and Secret
5. Add them to Vercel environment variables
6. Redeploy

## Alternative: Deploy via Vercel CLI

If you prefer CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts
# Add environment variables via CLI or dashboard
```

