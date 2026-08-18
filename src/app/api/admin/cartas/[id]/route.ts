import { NextResponse, type NextRequest } from "next/server";
import { hayAdminEnRequest } from "@/lib/auth";
import { ejecutar } from "@/lib/db";

export const dynamic = "force-dynamic";

type Contexto = { params: Promise<{ id: string }> };

async function idValido(ctx: Contexto) {
  const { id } = await ctx.params;
  const numero = Number(id);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

/** PATCH → activar / desactivar o editar el texto. */
export async function PATCH(req: NextRequest, ctx: Contexto) {
  if (!hayAdminEnRequest(req)) {
    return NextResponse.json({ error: "Necesitás iniciar sesión." }, { status: 401 });
  }
  const id = await idValido(ctx);
  if (!id) return NextResponse.json({ error: "Carta inválida." }, { status: 400 });

  const cuerpo = await req.json().catch(() => ({}));

  try {
    if (typeof cuerpo.activa === "boolean") {
      await ejecutar("UPDATE cartas SET activa = ? WHERE id = ?", [cuerpo.activa ? 1 : 0, id]);
    }
    if (typeof cuerpo.texto === "string" && cuerpo.texto.trim().length >= 4) {
      await ejecutar("UPDATE cartas SET texto = ? WHERE id = ?", [cuerpo.texto.trim(), id]);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/cartas PATCH]", error);
    return NextResponse.json({ error: "No se pudo actualizar la carta." }, { status: 503 });
  }
}

/** DELETE → borra la carta para siempre. */
export async function DELETE(req: NextRequest, ctx: Contexto) {
  if (!hayAdminEnRequest(req)) {
    return NextResponse.json({ error: "Necesitás iniciar sesión." }, { status: 401 });
  }
  const id = await idValido(ctx);
  if (!id) return NextResponse.json({ error: "Carta inválida." }, { status: 400 });

  try {
    await ejecutar("DELETE FROM cartas WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/cartas DELETE]", error);
    return NextResponse.json({ error: "No se pudo borrar la carta." }, { status: 503 });
  }
}
