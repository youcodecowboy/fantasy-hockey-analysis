import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.YAHOO_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_YAHOO_REDIRECT_URI;

  const debugInfo = {
    hasClientId: !!clientId,
    clientIdLength: clientId?.length || 0,
    hasRedirectUri: !!redirectUri,
    redirectUri: redirectUri || "NOT SET",
    redirectUriLength: redirectUri?.length || 0,
    redirectUriEncoded: redirectUri ? encodeURIComponent(redirectUri) : "NOT SET",
    nodeEnv: process.env.NODE_ENV,
  };

  return NextResponse.json(debugInfo, { status: 200 });
}

