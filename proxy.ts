// Protegge tutte le route /admin verificando il JWT nel cookie.
// Con Next.js 16+, questa logica corre come Proxy (Node.js runtime di default).
 
import { NextRequest, NextResponse } from "next/server";
 
const COOKIE_NAME = "aiki_admin_token";
 
// ── Helpers base64url (duplicati qui perché il proxy
//    non può importare liberamente da lib/ in base alla configurazione) ────
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
 
    // Controlla la scadenza
    const payload = JSON.parse(
      new TextDecoder().decode(b64urlDecode(body))
    );
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
 
// ── Proxy ─────────────────────────────────────────────
export async function proxy(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const isValid = token ? await verifyJwt(token) : false;
  
  const isLoginPage = req.nextUrl.pathname === "/login";

  // Scenario 1: L'utente È autenticato e sta cercando di andare su /login
  // Lo mandiamo direttamente all'admin
  if (isValid && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // Scenario 2: L'utente NON è autenticato e sta cercando di andare su una pagina protetta (NON /login)
  // Lo rimandiamo al login
  if (!isValid && !isLoginPage) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Scenario 3: 
  // - Utente autenticato che va su /admin -> Passa!
  // - Utente NON autenticato che va su /login (es. dopo il logout) -> Passa!
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/auth/admin/:path*", "/login"],
};