import { signToken, verifyToken, JwtPayload } from "./jwt";

export const USER_COOKIE_NAME = "aiki_user_token";
export const USER_TOKEN_TTL_MS = 1000 * 60 * 60 * 8;

export interface UserJwtPayload extends JwtPayload {
  id: number;
  role: "utente";
}

export async function signUserToken(payload: { sub: string; id: number }): Promise<string> {
  return signToken({ sub: payload.sub, role: "utente", id: payload.id });
}

export async function verifyUserToken(token: string): Promise<UserJwtPayload> {
  const payload = await verifyToken(token);
  if (payload.role !== "utente") throw new Error("Token non valido per utente.");
  if (!payload.id) throw new Error("Token utente malformato.");
  return payload as UserJwtPayload;
}
