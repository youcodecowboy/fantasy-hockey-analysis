import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

interface YahooTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface YahooUserInfo {
  sub: string;
  email?: string;
  name?: string;
}

// Store Yahoo OAuth tokens
export const storeYahooTokens = mutation({
  args: {
    yahooUserId: v.string(),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    expiresIn: v.number(),
    yahooUserInfo: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Find or create user
    let user = await ctx.db.get(userId);

    const now = Date.now();
    const tokenExpiry = now + args.expiresIn * 1000;

    if (user) {
      // Update existing user
      await ctx.db.patch(userId, {
        yahooUserId: args.yahooUserId,
        yahooAccessToken: args.accessToken,
        yahooRefreshToken: args.refreshToken,
        yahooTokenExpiry: tokenExpiry,
        updatedAt: now,
      });
      return userId;
    } else {
      // Update user with Yahoo info
      await ctx.db.patch(userId, {
        yahooUserId: args.yahooUserId,
        yahooAccessToken: args.accessToken,
        yahooRefreshToken: args.refreshToken,
        yahooTokenExpiry: tokenExpiry,
        updatedAt: now,
      });
      return userId;
    }
  },
});

// Get Yahoo access token for a user
export const getYahooToken = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);

    if (!user || !user.yahooAccessToken) {
      return null;
    }

    // Check if token needs refresh
    const now = Date.now();
    if (user.yahooTokenExpiry && user.yahooTokenExpiry < now + 60000) {
      // Token expires in less than 1 minute, needs refresh
      return { needsRefresh: true, userId: user._id };
    }

    return {
      accessToken: user.yahooAccessToken,
      needsRefresh: false,
    };
  },
});

// Refresh Yahoo access token
export const refreshYahooToken = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);

    if (!user || !user.yahooRefreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.YAHOO_CLIENT_ID}:${process.env.YAHOO_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: user.yahooRefreshToken,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token refresh failed: ${errorText}`);
    }

    const tokens: YahooTokenResponse = await response.json();
    const now = Date.now();
    const tokenExpiry = now + tokens.expires_in * 1000;

    await ctx.db.patch(user._id, {
      yahooAccessToken: tokens.access_token,
      yahooRefreshToken: tokens.refresh_token || user.yahooRefreshToken,
      yahooTokenExpiry: tokenExpiry,
      updatedAt: now,
    });

    return tokens.access_token;
  },
});

// Helper function to get valid access token (with auto-refresh)
export const getValidAccessToken = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const tokenInfo = await ctx.runQuery(api.yahoo.getYahooToken, {});

    if (!tokenInfo) {
      throw new Error("No Yahoo token found. Please connect your Yahoo account.");
    }

    if (tokenInfo.needsRefresh) {
      return await ctx.runMutation(api.yahoo.refreshYahooToken, {});
    }

    return tokenInfo.accessToken;
  },
});

// Check if user has Yahoo connected
export const isYahooConnected = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const user = await ctx.db.get(userId);

    return !!(user && user.yahooAccessToken);
  },
});

