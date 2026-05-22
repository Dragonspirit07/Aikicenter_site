// lib/jwt.ts
// JWT firmato con HMAC-SHA256 usando esclusivamente la Web Crypto API nativa.
// Nessuna dipendenza esterna.

const COOKIE_NAME  = "aiki_admin_token";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 8; // 8 ore

// ── Helpers base64url (solo Uint8Array, niente Buffer) ────────────────
function b64urlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64urlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary  = atob(base64);
  const bytes   = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ── Importa la chiave HMAC dalla variabile d'ambiente ─────────────────
async function getKey(): Promise<CryptoKey> {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET mancante o troppo corto (min 32 caratteri).");
  }
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// ── Payload del token ─────────────────────────────────────────────────
export interface JwtPayload {
  sub: string;   // username
  role: string;  // "admin"
  iat: number;   // issued at (epoch secondi)
  exp: number;   // expiration (epoch secondi)
}

// ── Firma e crea il token ─────────────────────────────────────────────
export async function signToken(payload: Omit<JwtPayload, "iat" | "exp">): Promise<string> {
  const key = await getKey();

  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_TTL_MS / 1000,
  };

  const header = b64urlEncode(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body   = b64urlEncode(new TextEncoder().encode(JSON.stringify(fullPayload)));
  const data   = `${header}.${body}`;

  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));

  return `${data}.${b64urlEncode(new Uint8Array(sigBuf))}`;
}

// ── Verifica e decodifica il token ────────────────────────────────────
export async function verifyToken(token: string): Promise<JwtPayload> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Token malformato.");

  const [headerB64, body, sig] = parts;

  const header: { alg?: string } = JSON.parse(new TextDecoder().decode(b64urlDecode(headerB64)));
  if (header.alg !== "HS256") {
    throw new Error("Algorithm not allowed.");
  }

  const key = await getKey();

  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    b64urlDecode(sig) as BufferSource,                            
    new TextEncoder().encode(`${headerB64}.${body}`)
  );

  if (!valid) throw new Error("Firma JWT non valida.");

  const payload: JwtPayload = JSON.parse(new TextDecoder().decode(b64urlDecode(body)));

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token scaduto.");
  }

  return payload;
}

// ── Costanti cookie esportate ─────────────────────────────────────────
export { COOKIE_NAME, TOKEN_TTL_MS };
