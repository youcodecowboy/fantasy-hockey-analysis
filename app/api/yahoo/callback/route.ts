import { NextRequest, NextResponse } from "next/server";

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

    // Store tokens via Convex HTTP endpoint
    // We'll use a temporary session approach - store in cookies and let client handle it
    const redirectUrl = new URL("/dashboard", request.url);
    redirectUrl.searchParams.set("yahoo_connected", "true");
    
    // Store tokens temporarily in cookies (will be read by client and stored in Convex)
    const response = NextResponse.redirect(redirectUrl);
    
    // Store in cookies temporarily (client will read and store in Convex)
    const tokenData = {
      yahooUserId: userInfo.sub,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      yahooUserInfo: userInfo,
    };
    
    // Encode the token data for cookie storage
    const tokenDataString = JSON.stringify(tokenData);
    
    response.cookies.set("yahoo_token_data", tokenDataString, {
      httpOnly: false, // Need client-side access to read and store in Convex
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 300, // 5 minutes - should be processed quickly
    });

    console.log("Yahoo OAuth callback: Tokens stored in cookie, redirecting to dashboard");
    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=oauth_error", request.url)
    );
  }
}

