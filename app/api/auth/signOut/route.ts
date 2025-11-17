import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Proxy to Convex Auth HTTP endpoint
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
    const response = await fetch(`${convexUrl}/auth/signOut`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("Cookie") || "",
      },
    });

    const responseText = await response.text();
    
    const nextResponse = new NextResponse(responseText, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });

    // Copy cookies from Convex response
    const setCookieHeader = response.headers.get("Set-Cookie");
    if (setCookieHeader) {
      nextResponse.headers.set("Set-Cookie", setCookieHeader);
    }

    return nextResponse;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Sign out failed" },
      { status: 500 }
    );
  }
}

