import { NextResponse, type NextRequest } from "next/server";
import { consultar } from "@/lib/db";
import { esSlugValido, type Carta } from "@/lib/tipos";

export const dynamic = "force-dynamic";

/** GET /api/cartas?juegos=desafios,verdad-o-reto → cartas activas para armar los mazos. */
export async function GET(req: NextRequest) {
  const pedidos = (req.nextUrl.searchParams.get("juegos") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(esSlugValido);

  if (pedidos.length === 0) {
    return NextResponse.json({ error: "Elegí al menos un juego." }, { status: 400 });
  }

  try {
    const marcadores = pedidos.map(() => "?").join(",");
    const cartas = await consultar<Carta>(
      `SELECT id, juego_slug, tipo, texto
         FROM cartas
        WHERE activa = 1 AND juego_slug IN (${marcadores})`,
      pedidos,
    );
    return NextResponse.json({ cartas });
  } catch (error) {
    console.error("[cartas]", error);
    return NextResponse.json({ error: "No se pudo leer la base de datos." }, { status: 503 });
  }
}
