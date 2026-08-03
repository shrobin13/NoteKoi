import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

/**
 * Server-side login handler — works without JavaScript (progressive enhancement).
 * The login <form action="/api/login"> posts here when JS is unavailable.
 * When JS IS available, React intercepts the click and uses the client-side API instead.
 */
export async function POST(req: NextRequest) {
  let email: string | null = null;
  let password: string | null = null;

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    email = params.get("email");
    password = params.get("password");
  } else {
    const body = await req.json().catch(() => ({}));
    email = body.email ?? null;
    password = body.password ?? null;
  }

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=missing", req.url));
  }

  const backendRes = await fetch(`${BACKEND}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!backendRes.ok) {
    return NextResponse.redirect(new URL("/login?error=invalid", req.url));
  }

  // Forward Set-Cookie headers from backend to browser
  const response = NextResponse.redirect(new URL("/", req.url));
  const setCookies = backendRes.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookies) {
    response.headers.append("Set-Cookie", cookie);
  }
  return response;
}
