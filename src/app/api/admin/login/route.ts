import { NextResponse, type NextRequest } from "next/server";
import { claveCorrecta, opcionesCookie, tokenSesion } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const cuerpo = await req.json().catch(() => ({}));
  const clave = typeof cuerpo.clave === "string" ? cuerpo.clave : "";

  if (!claveCorrecta(clave)) {
    // Pequeña demora para que no sirva de oráculo rápido a la fuerza bruta.
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: "Clave incorrecta." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({ ...opcionesCookie, value: tokenSesion() });
  return res;
}
