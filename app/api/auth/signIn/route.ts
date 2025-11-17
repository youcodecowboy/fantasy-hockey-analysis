import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Proxy to Convex Auth HTTP endpoint
    // Convex Auth routes are added via auth.addHttpRoutes(http) which makes them available at /auth/*
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
    
    // Call the Convex HTTP endpoint - auth routes are at /auth/signIn
    const response = await fetch(`${convexUrl}/http/auth/signIn`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("Cookie") || "",
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    const responseHeaders = new Headers();
    
    // Copy Set-Cookie headers from Convex response to set auth cookies
    const setCookie = response.headers.get("Set-Cookie");
    if (setCookie) {
      responseHeaders.set("Set-Cookie", setCookie);
    }
    
    // Copy other headers
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "set-cookie") {
        responseHeaders.set(key, value);
      }
    });
    
    return new NextResponse(responseText, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}

