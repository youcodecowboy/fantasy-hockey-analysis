# Yahoo OAuth Debugging Steps

## Current Issue: `invalid_redirect_uri`

The redirect URI is still not matching. Let's debug systematically.

## Step 1: Check What We're Actually Sending

### Option A: Check Vercel Function Logs
1. Go to Vercel Dashboard → Your Project → **Functions** tab
2. Click on `/api/yahoo/authorize`
3. Look for logs that say: `Yahoo OAuth authorize - Redirect URI: ...`
4. Copy the exact redirect URI shown

### Option B: Use Debug Endpoint
1. Visit: `https://fantasy-hockey-analysis.vercel.app/api/yahoo/debug`
2. This will show you the exact redirect URI from environment variables
3. Copy the `redirectUri` value shown

## Step 2: Verify Yahoo Developer Console

1. Go to: https://developer.yahoo.com/apps/
2. Find your app (App ID: `bg38KLw7`)
3. Click **Edit** or **View**
4. Look for these fields:
   - **Redirect URI(s)**
   - **Callback URL**
   - **OAuth Redirect URI**
   - **Application URL**

5. **Take a screenshot** of what's currently set

## Step 3: Common Issues

### Issue 1: Multiple Redirect URIs
Yahoo allows multiple redirect URIs. Make sure:
- Each URI is on a separate line OR
- They're comma-separated (check Yahoo's format)
- **Remove any old/incorrect URIs**

### Issue 2: Case Sensitivity
Some systems are case-sensitive. Make sure:
- Protocol is lowercase: `https://` not `HTTPS://`
- Domain matches exactly: `fantasy-hockey-analysis.vercel.app`

### Issue 3: Trailing Slash
Make sure there's NO trailing slash:
- ✅ `https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback`
- ❌ `https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback/`

### Issue 4: URL Encoding
The redirect URI might be getting double-encoded. Check Vercel logs to see the actual URL being sent.

## Step 4: Try These Solutions

### Solution A: Clear and Re-add Redirect URI
1. In Yahoo Developer Console, **delete** the redirect URI field completely
2. Save the app
3. Wait 2 minutes
4. Add back: `https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback`
5. Save again
6. Wait 5 minutes for propagation
7. Try again

### Solution B: Check for Hidden Characters
1. Copy the redirect URI from Vercel debug endpoint
2. Paste it into a text editor
3. Check for:
   - Extra spaces
   - Line breaks
   - Special characters
   - Non-printable characters

### Solution C: Try Without Path
Some Yahoo apps require just the domain. Try adding:
- `https://fantasy-hockey-analysis.vercel.app` (without `/api/yahoo/callback`)

Then update your code to handle the callback at the root level.

## Step 5: Verify Environment Variable

In Vercel Dashboard → Settings → Environment Variables:

1. Find `NEXT_PUBLIC_YAHOO_REDIRECT_URI`
2. Click **Edit**
3. Make sure it's exactly: `https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback`
4. Check:
   - No extra spaces before/after
   - No quotes around it
   - No trailing slash
   - Exact match with Yahoo console

## Step 6: Check Vercel Deployment

1. Go to Vercel → Deployments
2. Make sure the latest deployment completed successfully
3. Check the deployment logs for any errors
4. Verify the deployment used the updated environment variables

## Step 7: Test with Debug Endpoint

After making changes:
1. Visit: `https://fantasy-hockey-analysis.vercel.app/api/yahoo/debug`
2. Verify the `redirectUri` matches what's in Yahoo console
3. If they match exactly, try connecting again

## Still Not Working?

If it still doesn't work after all these steps:

1. **Screenshot** the Yahoo Developer Console redirect URI field
2. **Screenshot** the Vercel environment variable
3. **Copy** the redirect URI from Vercel function logs
4. Share all three so we can compare them exactly

## Alternative: Check Yahoo API Documentation

Yahoo's OAuth documentation might have specific requirements:
- https://developer.yahoo.com/oauth2/guide/flows_authcode/
- https://developer.yahoo.com/oauth2/guide/troubleshooting/

