import { NextRequest, NextResponse } from "next/server";
import { findAdminByUsername } from "@/lib/models/admin";
import { findByEmail } from "@/lib/models/iscrizioni";
import { verifyPassword } from "@/lib/password";
import { signToken, COOKIE_NAME, TOKEN_TTL_MS } from "@/lib/jwt";
import { signUserToken, USER_COOKIE_NAME, USER_TOKEN_TTL_MS } from "@/lib/jwt-utente";

export async function POST(req: NextRequest) {
  let username: string, password: string;
  try {
    ({ username, password } = await req.json());
  } catch {
    return NextResponse.json({ error: "Body JSON non valido." }, { status: 400 });
  }

  if (!username?.trim() || !password) {
    return NextResponse.json({ error: "Email e password obbligatorie." }, { status: 400 });
  }

  await new Promise((r) => setTimeout(r, 500));

  const utente = await findByEmail(username.trim().toLowerCase()).catch(() => null);
  if (utente) {
    const ok = await verifyPassword(password, utente.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "Credenziali non valide." }, { status: 401 });
    }
    const token = await signUserToken({ sub: utente.email, id: utente.id });
    const response = NextResponse.json({ ok: true, redirect: "/utente" });
    response.cookies.set(USER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: USER_TOKEN_TTL_MS / 1000,
    });
    return response;
  }

  const admin = await findAdminByUsername(username.trim()).catch(() => null);
  if (!admin || !admin.active) {
    return NextResponse.json({ error: "Credenziali non valide." }, { status: 401 });
  }
  const ok = await verifyPassword(password, admin.password_hash);
  if (!ok) {
    return NextResponse.json({ error: "Credenziali non valide." }, { status: 401 });
  }
  const token = await signToken({ sub: admin.username, role: admin.role });
  const response = NextResponse.json({ ok: true, redirect: "/admin" });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_TTL_MS / 1000,
  });
  return response;
}
