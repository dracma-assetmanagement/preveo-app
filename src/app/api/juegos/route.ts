import { NextResponse } from "next/server";
import { consultar } from "@/lib/db";
import { JUEGOS, type Juego } from "@/lib/tipos";

export const dynamic = "force-dynamic";

type Fila = Juego & { cartas: number };

export async function GET() {
  try {
    const filas = await consultar<Fila>(
      `SELECT j.slug, j.nombre, j.emoji, j.bajada,
              COUNT(c.id) AS cartas
         FROM juegos j
         LEFT JOIN cartas c ON c.juego_slug = j.slug AND c.activa = 1
        WHERE j.activo = 1
        GROUP BY j.slug, j.nombre, j.emoji, j.bajada, j.orden
        ORDER BY j.orden ASC`,
    );
    return NextResponse.json({ juegos: filas, fuente: "mysql" });
  } catch {
    // Si la base no responde, la app igual arranca con el catálogo de respaldo.
    return NextResponse.json({ juegos: JUEGOS, fuente: "respaldo" }, { status: 200 });
  }
}
