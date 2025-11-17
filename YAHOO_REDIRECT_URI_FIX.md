# Yahoo OAuth Redirect URI Fix

## The Error
You're seeing: `error=invalid_request&error_description=invalid+redirect_uri`

This means the redirect URI in your Yahoo Developer Console doesn't match what we're sending.

## Current Redirect URI
Your app is configured to use: `https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback`

## Steps to Fix

### 1. Check Your Yahoo Developer Console
1. Go to: https://developer.yahoo.com/apps/
2. Find your app (the one with Client ID: `dj0yJmk9R29IaVg0cHpTUTliJmQ9WVdrOVltY3pPRXRNZHpjbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PWU5`)
3. Click on it to edit

### 2. Check the Redirect URI Field
Look for a field called:
- "Redirect URI"
- "Callback URL"
- "OAuth Redirect URI"
- "Application URL"

### 3. Set It Exactly To:
```
https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback
```

**IMPORTANT:** It must match EXACTLY:
- ✅ Use `https://` (not `http://`)
- ✅ Include `/api/yahoo/callback` at the end
- ✅ No trailing slash
- ✅ No extra spaces or characters

### 4. Save Changes
After updating, save the changes in Yahoo's console.

### 5. Wait a Few Minutes
Yahoo sometimes takes a few minutes to propagate changes.

### 6. Try Again
Go back to your app and try connecting Yahoo again.

## Common Mistakes

❌ Wrong:
- `https://fantasy-hockey-analysis.vercel.app` (missing `/api/yahoo/callback`)
- `https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback/` (trailing slash)
- `http://fantasy-hockey-analysis.vercel.app/api/yahoo/callback` (http instead of https)
- `fantasy-hockey-analysis.vercel.app/api/yahoo/callback` (missing protocol)

✅ Correct:
- `https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback`

## Verify Environment Variable
Also make sure in Vercel (Project Settings → Environment Variables):
- `NEXT_PUBLIC_YAHOO_REDIRECT_URI` = `https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback`

## Still Not Working?
If it still doesn't work after updating:
1. Double-check for typos
2. Make sure you saved the changes in Yahoo console
3. Wait 5-10 minutes for changes to propagate
4. Try clearing browser cache/cookies
5. Check Vercel logs for the exact redirect URI being sent

