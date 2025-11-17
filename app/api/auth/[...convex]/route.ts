import { NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/auth", "");
  
  // Convex HTTP routes are at /http/*, so prepend /http to the path
  const convexPath = `/http${path}`;
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}${convexPath}${url.search}`, {
    method: "GET",
    headers: request.headers,
  });
  return new Response(await response.text(), {
    status: response.status,
    headers: response.headers,
  });
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api/auth", "");
  
  // Convex HTTP routes are at /http/*, so prepend /http to the path
  const convexPath = `/http${path}`;
  
  const body = await request.text();
  const response = await fetch(`${process.env.NEXT_PUBLIC_CONVEX_URL}${convexPath}${url.search}`, {
    method: "POST",
    headers: request.headers,
    body,
  });
  return new Response(await response.text(), {
    status: response.status,
    headers: response.headers,
  });
}

