import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/dashboard?error=no_code", request.url)
    );
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.YAHOO_CLIENT_ID}:${process.env.YAHOO_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.NEXT_PUBLIC_YAHOO_REDIRECT_URI!,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      return NextResponse.redirect(
        new URL("/dashboard?error=token_exchange_failed", request.url)
      );
    }

    const tokens = await tokenResponse.json();

    // Get user info from Yahoo
    const userResponse = await fetch("https://api.login.yahoo.com/openid/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(
        new URL("/dashboard?error=user_info_failed", request.url)
      );
    }

    const userInfo = await userResponse.json();

    // Store tokens in Convex
    // Note: In a real app, you'd need to get the current user ID from Convex Auth
    // For now, we'll need to handle this in a mutation that takes the user ID
    await convex.mutation(api.yahoo.storeYahooTokens, {
      yahooUserId: userInfo.sub,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      yahooUserInfo: userInfo,
    });

    return NextResponse.redirect(new URL("/dashboard?connected=true", request.url));
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=oauth_error", request.url)
    );
  }
}

