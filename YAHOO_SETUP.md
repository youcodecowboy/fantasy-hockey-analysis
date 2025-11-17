# Yahoo OAuth Setup Guide

## Step-by-Step Instructions

### 1. Create Yahoo Application

1. Go to [Yahoo Developer Network](https://developer.yahoo.com/apps/create/)
2. Sign in with your Yahoo account
3. Click "Create an App"
4. Fill in the application details:
   - **Application Name**: Fantasy Hockey Analysis (or your preferred name)
   - **Application Type**: Web Application
   - **Description**: App for analyzing fantasy hockey teams
   - **Home Page URL**: Your Vercel URL or `http://localhost:3000` for development
   - **Redirect URI(s)**: 
     - For development: `http://localhost:3000/api/yahoo/callback`
     - For production: `https://your-app-name.vercel.app/api/yahoo/callback`

### 2. Get Your Credentials

After creating the app, you'll receive:
- **Client ID** (Consumer Key)
- **Client Secret** (Consumer Secret)

### 3. Configure Environment Variables

#### For Local Development (`.env.local`):

```env
# Yahoo OAuth
YAHOO_CLIENT_ID=your_client_id_from_yahoo
YAHOO_CLIENT_SECRET=your_client_secret_from_yahoo
NEXT_PUBLIC_YAHOO_REDIRECT_URI=http://localhost:3000/api/yahoo/callback
```

#### For Vercel Production:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add:
   - `YAHOO_CLIENT_ID` = your client ID
   - `YAHOO_CLIENT_SECRET` = your client secret
   - `NEXT_PUBLIC_YAHOO_REDIRECT_URI` = `https://your-app-name.vercel.app/api/yahoo/callback`

### 4. Add Redirect URI to Yahoo

**Important**: You need to add BOTH URLs to your Yahoo app:
- Development: `http://localhost:3000/api/yahoo/callback`
- Production: `https://your-app-name.vercel.app/api/yahoo/callback`

Yahoo allows multiple redirect URIs, so you can add both.

### 5. Test the Connection

1. Start your local dev server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Click "Connect Yahoo Account"
4. You should be redirected to Yahoo for authorization
5. After authorizing, you'll be redirected back to your app

## Troubleshooting

- **"Invalid redirect URI"**: Make sure the redirect URI in Yahoo matches exactly what's in your environment variables
- **"Client ID not found"**: Double-check your `YAHOO_CLIENT_ID` in `.env.local`
- **CORS errors**: Make sure you're using the correct redirect URI for your environment

## Quick Start (Development)

1. Create Yahoo app with redirect: `http://localhost:3000/api/yahoo/callback`
2. Copy Client ID and Secret
3. Add to `.env.local`
4. Run `npm run dev`
5. Test the connection!

