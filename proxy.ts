import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "aiki_admin_token";
const USER_COOKIE  = "aiki_user_token";

function b64urlDecode(str: string): Uint8Array<ArrayBuffer> {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function verifyJwt(token: string): Promise<boolean> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return false;
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [header, body, sig] = parts;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      b64urlDecode(sig),
      new TextEncoder().encode(`${header}.${body}`)
    );
    if (!valid) return false;
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body)));
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isAdminPath = path.startsWith("/admin") || path.startsWith("/api/auth/admin");
  const isUserPath  = path.startsWith("/utente") || path.startsWith("/api/auth/utente");
  const isLoginPage = path === "/login";

  const adminToken = req.cookies.get(ADMIN_COOKIE)?.value;
  const userToken  = req.cookies.get(USER_COOKIE)?.value;

  const adminValid = adminToken ? await verifyJwt(adminToken) : false;
  const userValid  = userToken ? await verifyJwt(userToken) : false;

  if (isLoginPage) {
    if (adminValid) return NextResponse.redirect(new URL("/admin", req.url));
    if (userValid)  return NextResponse.redirect(new URL("/utente", req.url));
    return NextResponse.next();
  }

  if (isAdminPath) {
    if (!adminValid) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", path);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (isUserPath) {
    if (!userValid) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", path);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/auth/admin/:path*",
    "/utente/:path*",
    "/api/auth/utente/:path*",
    "/login",
  ],
};
