# Quick Start - Run Locally

## Step 1: Start Convex (Terminal 1)
```bash
npm run convex:dev
```
Wait until you see: `Convex functions ready!`

## Step 2: Start Next.js (Terminal 2)
```bash
npm run dev
```
Wait until you see: `Ready on http://localhost:3000`

## Step 3: Open Browser
Go to: http://localhost:3000

## If You See "Incorrect URL" Error

1. **Check `.env.local` exists**:
   ```bash
   cat .env.local
   ```
   Should show `NEXT_PUBLIC_CONVEX_URL=https://little-manatee-959.convex.cloud`

2. **Restart Next.js dev server**:
   - Stop it (Ctrl+C)
   - Run `npm run dev` again

3. **Make sure Convex dev is running**:
   - Check Terminal 1 - should show Convex is connected

## Note About UI Changes

The UI changes (light mode, matchup components) are in the code but may not show if:
- Browser cache needs clearing (hard refresh: Cmd+Shift+R)
- Vercel hasn't deployed the latest changes yet

To see the latest UI locally:
1. Make sure you have the latest code: `git pull`
2. Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
3. Check browser console for any errors

