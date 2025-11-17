# Yahoo OAuth Setup - Quick Guide

## Your Yahoo Credentials
- **Client ID**: `dj0yJmk9R29IaVg0cHpTUTliJmQ9WVdrOVltY3pPRXRNZHpjbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PWU5`
- **Client Secret**: `6a0e810126f47f294d702bb80a9be08f242d6128`
- **App ID**: `bg38KLw7`

## Step 1: Get Your Vercel URL

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on your project: `fantasy-hockey-analysis`
3. Your production URL will be something like: `https://fantasy-hockey-analysis.vercel.app`
4. Copy this URL - you'll need it for the redirect URI

## Step 2: Update Yahoo App Redirect URI

1. Go to [Yahoo Developer Console](https://developer.yahoo.com/apps/)
2. Find your app (App ID: `bg38KLw7`)
3. Edit the app settings
4. Add/Update the Redirect URI to: `https://YOUR-VERCEL-URL.vercel.app/api/yahoo/callback`
   - Replace `YOUR-VERCEL-URL` with your actual Vercel URL
   - Example: `https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback`
5. Save the changes

## Step 3: Add Environment Variables to Vercel

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the following variables:

### Required Variables:

```
YAHOO_CLIENT_ID=dj0yJmk9R29IaVg0cHpTUTliJmQ9WVdrOVltY3pPRXRNZHpjbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PWU5
```

```
YAHOO_CLIENT_SECRET=6a0e810126f47f294d702bb80a9be08f242d6128
```

```
NEXT_PUBLIC_YAHOO_REDIRECT_URI=https://YOUR-VERCEL-URL.vercel.app/api/yahoo/callback
```
(Replace `YOUR-VERCEL-URL` with your actual Vercel URL)

```
NEXT_PUBLIC_CONVEX_URL=https://little-manatee-959.convex.cloud
```

### Optional Variables:

```
TOGETHER_API_KEY=your_together_api_key_here
```
(Add this when you have your Together.ai API key)

```
CONVEX_AUTH_APPLICATION_ID=default
```

## Step 4: Redeploy

After adding environment variables:
1. Go to the **Deployments** tab in Vercel
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger a redeploy

## Step 5: Test the Connection

1. Visit your Vercel URL: `https://YOUR-VERCEL-URL.vercel.app`
2. Click "Connect Yahoo Account"
3. You should be redirected to Yahoo for authorization
4. After authorizing, you'll be redirected back to your app

## Troubleshooting

- **"Invalid redirect URI"**: Make sure the redirect URI in Yahoo matches exactly what's in `NEXT_PUBLIC_YAHOO_REDIRECT_URI`
- **"Client ID not found"**: Double-check that `YAHOO_CLIENT_ID` is set correctly in Vercel
- **Connection issues**: Make sure you've redeployed after adding environment variables

