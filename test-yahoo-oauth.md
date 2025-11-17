# Testing Yahoo OAuth Flow

## Important Note
Yahoo OAuth **does not allow localhost URLs**. You must test on your production Vercel deployment.

## Testing Steps

### 1. Verify Environment Variables in Vercel
Make sure these are set in Vercel (Project Settings → Environment Variables):
- `YAHOO_CLIENT_ID`
- `YAHOO_CLIENT_SECRET`  
- `NEXT_PUBLIC_YAHOO_REDIRECT_URI` = `https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback`
- `NEXT_PUBLIC_CONVEX_URL`

### 2. Test on Production URL
1. Go to: `https://fantasy-hockey-analysis.vercel.app/login`
2. Sign in with your account
3. Go to dashboard
4. Click "Connect Yahoo Account"
5. Authorize with Yahoo
6. You should be redirected back to dashboard

### 3. Check Browser Console
After authorizing, open DevTools Console and look for:
- `"Yahoo connected flag detected, looking for cookie..."`
- `"All cookies:"` - Should list cookies
- `"Found yahoo_token_data cookie"` or `"⚠️ No yahoo_token_data cookie found"`
- `"✅ Yahoo tokens stored successfully in Convex"` or error messages

### 4. Check Network Tab
1. Open DevTools → Network tab
2. Filter by "yahoo" or "callback"
3. Look for request to `/api/yahoo/callback?code=...`
4. Check:
   - Status code (should be 302 redirect)
   - Response headers (should have `Set-Cookie: yahoo_token_data=...`)
   - Request URL (should match your redirect URI exactly)

### 5. Check Cookies
1. DevTools → Application → Cookies → `https://fantasy-hockey-analysis.vercel.app`
2. After OAuth callback, look for `yahoo_token_data` cookie
3. If missing, check:
   - Cookie domain matches
   - Secure flag (should be true in production)
   - SameSite setting

### 6. Check Vercel Function Logs
1. Vercel Dashboard → Your Project → Functions → `/api/yahoo/callback`
2. Look for console.log messages:
   - `"Yahoo OAuth callback received"`
   - `"Yahoo token exchange successful"`
   - `"Yahoo user info retrieved"`
   - `"Yahoo OAuth callback: Tokens stored in cookie, redirecting to dashboard"`

## Troubleshooting

### If callback isn't being called:
- Verify redirect URI in Yahoo console matches exactly
- Check Vercel logs for any errors
- Ensure environment variables are set

### If cookie isn't being set:
- Check Vercel function logs for errors
- Verify cookie settings (secure, sameSite, path)
- Check browser console for cookie-related errors

### If tokens aren't being stored:
- Check browser console for mutation errors
- Verify user is authenticated (check Convex Auth state)
- Check Convex logs for errors

## Expected Flow

1. User clicks "Connect Yahoo Account"
2. Redirected to Yahoo authorization page
3. User authorizes
4. Yahoo redirects to `/api/yahoo/callback?code=...`
5. Callback route:
   - Exchanges code for tokens
   - Gets user info
   - Sets cookie with token data
   - Redirects to `/dashboard?yahoo_connected=true`
6. Dashboard page:
   - Reads cookie
   - Calls `storeYahooTokens` mutation
   - Reloads page
   - Shows "Yahoo Connected" status

