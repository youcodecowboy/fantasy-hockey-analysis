# URGENT: Fix Redirect URI

## The Problem
Your redirect URI has `/dashboard/` in it, which is WRONG!

**Current (WRONG):**
```
https://fantasy-hockey-analysis.vercel.app/dashboard/api/yahoo/callback
```

**Should be:**
```
https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback
```

## Fix Steps

### Step 1: Fix Vercel Environment Variable
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_YAHOO_REDIRECT_URI`
3. Click **Edit**
4. Change it to: `https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback`
5. **Remove `/dashboard/` from the path**
6. Save

### Step 2: Fix Yahoo Developer Console
1. Go to: https://developer.yahoo.com/apps/
2. Find your app (App ID: `bg38KLw7`)
3. Click **Edit**
4. Find the **Redirect URI** field
5. Change it to: `https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback`
6. **Remove `/dashboard/` from the path**
7. Save

### Step 3: Redeploy
After fixing both:
1. Go to Vercel → Deployments
2. Click **⋯** on latest deployment
3. Click **Redeploy**
4. OR push a commit to trigger redeploy

### Step 4: Verify
After redeploy, visit:
```
https://fantasy-hockey-analysis.vercel.app/api/yahoo/debug
```

You should see:
```json
{
  "redirectUri": "https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback"
}
```

**NOT:**
```json
{
  "redirectUri": "https://fantasy-hockey-analysis.vercel.app/dashboard/api/yahoo/callback"
}
```

## Why This Matters
The callback route is at `/api/yahoo/callback`, not `/dashboard/api/yahoo/callback`. The `/dashboard/` path doesn't exist for API routes in Next.js.

