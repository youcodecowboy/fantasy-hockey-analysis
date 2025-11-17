# Yahoo OAuth Debugging Guide

## Your Yahoo Configuration
- **Redirect URI**: `https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback`
- **Client ID**: `dj0yJmk9R29laVg0cHpTUTliJmQ9WVdrOVltY3pPRXRNZHpjbWNHbzINQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PWU5`

## Debugging Steps

### 1. Check Browser Console
After clicking "Connect Yahoo Account" and authorizing, check the browser console for:
- `"Yahoo connected flag detected, looking for cookie..."`
- `"All cookies:"` - Should show all cookies including `yahoo_token_data`
- `"Found yahoo_token_data cookie"` or `"⚠️ No yahoo_token_data cookie found"`

### 2. Check Network Tab
1. Open DevTools → Network tab
2. Click "Connect Yahoo Account"
3. After authorizing, look for:
   - Request to `/api/yahoo/callback?code=...`
   - Status should be `302` (redirect)
   - Check Response Headers for `Set-Cookie: yahoo_token_data=...`

### 3. Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → Logs
2. Look for console.log messages from `/api/yahoo/callback`:
   - `"Yahoo OAuth callback received"`
   - `"Yahoo token exchange successful"`
   - `"Yahoo user info retrieved"`

### 4. Check Cookies
1. Open DevTools → Application → Cookies
2. After OAuth callback, check if `yahoo_token_data` cookie exists
3. If missing, the cookie might not be setting due to:
   - Domain mismatch
   - Secure flag in production
   - SameSite restrictions

### 5. Common Issues

**Issue: Cookie not being set**
- Check if `secure: true` is causing issues (should only be true in production)
- Verify domain matches exactly
- Check browser console for cookie-related errors

**Issue: Callback not being called**
- Verify redirect URI matches EXACTLY in Yahoo console
- Check Vercel logs for any errors
- Ensure environment variables are set correctly

**Issue: Token storage fails**
- Check Convex logs for errors
- Verify user is authenticated before storing tokens
- Check browser console for mutation errors

## Next Steps After Debugging

Once you identify where the flow breaks:
1. Share the console logs
2. Share any errors from Vercel logs
3. Share what you see in the Network tab

