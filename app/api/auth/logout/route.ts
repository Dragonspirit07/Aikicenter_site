import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/jtw";
import { USER_COOKIE_NAME } from "@/lib/jwt-utente";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const opts = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 0 };
  response.cookies.set(COOKIE_NAME, "", opts);
  response.cookies.set(USER_COOKIE_NAME, "", opts);
  return response;
}
