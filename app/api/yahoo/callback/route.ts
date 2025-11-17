import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  console.log("Yahoo OAuth callback received:", { code: code ? "present" : "missing", state, error });

  if (error) {
    console.error("Yahoo OAuth error:", error);
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    console.error("Yahoo OAuth callback: No code received");
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
    console.log("Yahoo token exchange successful");

    // Get user info from Yahoo
    // Note: We might not need user info if we can use the token directly
    // For now, let's try to get it, but if it fails, we'll proceed with just the tokens
    let userInfo: any = { sub: "unknown" };
    
    try {
      const userResponse = await fetch("https://api.login.yahoo.com/openid/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error("Failed to get Yahoo user info:", errorText);
        console.error("Response status:", userResponse.status);
        console.error("Response headers:", Object.fromEntries(userResponse.headers.entries()));
        
        // If userinfo fails, we can still proceed - we'll use a placeholder user ID
        // The token itself is what we need for API calls
        console.warn("User info fetch failed, but proceeding with tokens");
        userInfo = { sub: `yahoo_user_${Date.now()}` };
      } else {
        userInfo = await userResponse.json();
        console.log("Yahoo user info retrieved:", { userId: userInfo.sub, email: userInfo.email });
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      // Continue anyway - we have the tokens which is what we need
      userInfo = { sub: `yahoo_user_${Date.now()}` };
    }

    // Store tokens via Convex HTTP endpoint
    // We'll use a temporary session approach - store in cookies and let client handle it
    const redirectUrl = new URL("/dashboard", request.url);
    redirectUrl.searchParams.set("yahoo_connected", "true");
    
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
    
    // Set cookie with proper encoding
    // In production, cookies need to be set with secure flag and proper domain
    const cookieOptions: any = {
      httpOnly: false, // Need client-side access to read and store in Convex
      secure: true, // Always secure in production (HTTPS required)
      sameSite: "lax" as const,
      path: "/",
      maxAge: 300, // 5 minutes - should be processed quickly
    };

    // Create redirect response with cookie
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set("yahoo_token_data", encodeURIComponent(tokenDataString), cookieOptions);

    console.log("Yahoo OAuth callback: Tokens stored in cookie, redirecting to dashboard");
    console.log("Cookie set with data length:", tokenDataString.length);
    console.log("Redirect URL:", redirectUrl.toString());
    
    // Also add token data to URL hash as fallback (won't be sent to server, client-side only)
    // Note: NextResponse.redirect doesn't preserve hash, so we'll handle this client-side
    // The hash will be added by modifying the Location header
    const locationHeader = redirectUrl.toString() + `#yahoo_tokens=${encodeURIComponent(tokenDataString)}`;
    response.headers.set("Location", locationHeader);
    
    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=oauth_error", request.url)
    );
  }
}

