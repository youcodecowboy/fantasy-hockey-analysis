# Yahoo OAuth Setup - Final Checklist

## ✅ Your Configuration

**Vercel URL**: https://fantasy-hockey-analysis.vercel.app

**Yahoo Redirect URI**: `https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback`

**Yahoo Credentials**:
- Client ID: `dj0yJmk9R29IaVg0cHpTUTliJmQ9WVdrOVltY3pPRXRNZHpjbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PWU5`
- Client Secret: `6a0e810126f47f294d702bb80a9be08f242d6128`
- App ID: `bg38KLw7`

## ✅ Verify Vercel Environment Variables

Make sure these are set in Vercel (Project Settings → Environment Variables):

1. ✅ `YAHOO_CLIENT_ID` = `dj0yJmk9R29IaVg0cHpTUTliJmQ9WVdrOVltY3pPRXRNZHpjbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PWU5`
2. ✅ `YAHOO_CLIENT_SECRET` = `6a0e810126f47f294d702bb80a9be08f242d6128`
3. ✅ `NEXT_PUBLIC_YAHOO_REDIRECT_URI` = `https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback`
4. ✅ `NEXT_PUBLIC_CONVEX_URL` = `https://little-manatee-959.convex.cloud`
5. ⚠️ `TOGETHER_API_KEY` (optional - add when you have it)
6. ⚠️ `CONVEX_AUTH_APPLICATION_ID` = `default` (optional)

## ✅ Verify Yahoo App Settings

1. Go to [Yahoo Developer Console](https://developer.yahoo.com/apps/)
2. Find your app (App ID: `bg38KLw7`)
3. **IMPORTANT**: Make sure the Redirect URI is set to:
   ```
   https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback
   ```
4. The redirect URI must match **exactly** (including https, no trailing slash)

## 🧪 Test the Connection

1. **Wait for Vercel to redeploy** (after the latest commit)
2. Visit: https://fantasy-hockey-analysis.vercel.app/dashboard
3. Click **"Connect Yahoo Account"**
4. You should be redirected to Yahoo for authorization
5. After authorizing, you'll be redirected back to your dashboard
6. The "Yahoo Connected" status should appear

## 🔧 Troubleshooting

### "Invalid redirect URI" error
- **Check**: Redirect URI in Yahoo app matches exactly: `https://fantasy-hockey-analysis.vercel.app/api/yahoo/callback`
- **Check**: `NEXT_PUBLIC_YAHOO_REDIRECT_URI` in Vercel matches the same URL
- **Fix**: Update both to match exactly (case-sensitive, no trailing slash)

### "Client ID not found" error
- **Check**: `YAHOO_CLIENT_ID` is set correctly in Vercel
- **Fix**: Copy the Client ID exactly as shown above

### Connection works but tokens not stored
- **Check**: Browser console for errors
- **Check**: Convex dashboard for any errors
- **Note**: You need to be authenticated with Convex Auth first (the app uses ConvexCredentials)

## 📝 Next Steps After Connection

Once Yahoo is connected:
1. Click **"Refresh Data"** to sync your leagues
2. Select a league to view your team
3. Go to **Free Agents** to see available players
4. Use **AI Analysis** to get recommendations
5. Check **Opponents** for matchup insights

## 🎉 You're All Set!

Your app is now ready to analyze your fantasy hockey team!

