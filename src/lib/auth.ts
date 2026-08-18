import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const COOKIE_ADMIN = "preveo_admin";
const DURACION = 60 * 60 * 8; // 8 horas

function secreto() {
  return process.env.ADMIN_SECRET ?? "preveo-dev-secret";
}

function claveEsperada() {
  return process.env.ADMIN_PASSWORD ?? "noputas";
}

/** Valor firmado que guardamos en la cookie. No es reversible ni adivinable sin ADMIN_SECRET. */
export function tokenSesion() {
  return crypto.createHmac("sha256", secreto()).update("preveo-admin-v1").digest("hex");
}

export function claveCorrecta(intento: string) {
  const a = Buffer.from(intento);
  const b = Buffer.from(claveEsperada());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Para páginas y layouts (Server Components). */
export async function hayAdmin() {
  const galletas = await cookies();
  return galletas.get(COOKIE_ADMIN)?.value === tokenSesion();
}

/** Para route handlers. */
export function hayAdminEnRequest(req: NextRequest) {
  return req.cookies.get(COOKIE_ADMIN)?.value === tokenSesion();
}

export const opcionesCookie = {
  name: COOKIE_ADMIN,
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: DURACION,
  secure: process.env.NODE_ENV === "production",
};
