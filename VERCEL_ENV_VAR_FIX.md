# Vercel Environment Variable Fix

## Important: Environment Variables Require Redeploy

When you change environment variables in Vercel, **you must redeploy** for the changes to take effect!

## What Happened

Your `NEXT_PUBLIC_YAHOO_REDIRECT_URI` was incorrectly set to:
```
https://https://https://fantasy-hockey-analysis.vercel.app/dashboard/api/yahoo/callback
```

## Correct Value

It should be:
```
https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback
```

**Note:** The path is `/api/yahoo/callback` NOT `/dashboard/api/yahoo/callback`

## Steps to Fix

### 1. Verify in Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Select your project: `fantasy-hockey-analysis`
3. Go to: **Settings** → **Environment Variables**
4. Find: `NEXT_PUBLIC_YAHOO_REDIRECT_URI`
5. Verify it's set to: `https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback`
6. Make sure it's enabled for **Production**, **Preview**, and **Development**

### 2. Redeploy
After updating the environment variable, you need to redeploy:

**Option A: Trigger via Git Push**
```bash
git commit --allow-empty -m "Trigger redeploy for env var fix"
git push
```

**Option B: Manual Redeploy in Vercel**
1. Go to your project in Vercel dashboard
2. Click on **Deployments** tab
3. Find the latest deployment
4. Click the **⋯** (three dots) menu
5. Click **Redeploy**

### 3. Verify After Redeploy
After redeploy completes:
1. Check Vercel function logs when you click "Connect Yahoo Account"
2. Look for: `Yahoo OAuth authorize - Redirect URI: https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback`
3. Make sure it matches exactly what's in Yahoo Developer Console

### 4. Also Verify Yahoo Developer Console
Make sure Yahoo Developer Console has the same redirect URI:
```
https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback
```

## Why Redeploy is Needed

- Environment variables are baked into the build at build time
- Changing them in the dashboard doesn't affect running deployments
- You must rebuild/redeploy for new values to be used

## After Redeploy

Wait for the deployment to complete (usually 1-2 minutes), then try connecting Yahoo again!

