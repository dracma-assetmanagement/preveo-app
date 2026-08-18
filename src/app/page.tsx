import { Preveo } from "@/components/Preveo";
import { consultar } from "@/lib/db";
import { JUEGOS, type Juego } from "@/lib/tipos";

export const dynamic = "force-dynamic";

type Fila = Juego & { cartas: number };

async function traerJuegos(): Promise<(Juego & { cartas?: number })[]> {
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
    return filas.length ? filas.map((f) => ({ ...f, cartas: Number(f.cartas) })) : JUEGOS;
  } catch (error) {
    console.error("[home] MySQL no responde, uso el catálogo de respaldo:", error);
    return JUEGOS;
  }
}

export default async function Home() {
  const juegos = await traerJuegos();
  return <Preveo juegos={juegos} />;
}
