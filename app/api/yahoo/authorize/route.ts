import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.YAHOO_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_YAHOO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Yahoo OAuth not configured" },
      { status: 500 }
    );
  }

  // Generate a random state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "fspt-r",
    state,
  });

  const authUrl = `https://api.login.yahoo.com/oauth2/request_auth?${params.toString()}`;

  // Store state in a cookie or session for verification
  const response = NextResponse.redirect(authUrl);
  response.cookies.set("yahoo_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  });

  return response;
}

