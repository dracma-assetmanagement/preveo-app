import { NextResponse, type NextRequest } from "next/server";
import { hayAdminEnRequest } from "@/lib/auth";
import { consultar, ejecutar } from "@/lib/db";
import { esSlugValido, type Carta } from "@/lib/tipos";

export const dynamic = "force-dynamic";

const TIPOS_VALIDOS = ["verdad", "reto"];

/** GET /api/admin/cartas?juego=slug → todas las cartas, activas e inactivas. */
export async function GET(req: NextRequest) {
  if (!hayAdminEnRequest(req)) {
    return NextResponse.json({ error: "Necesitás iniciar sesión." }, { status: 401 });
  }

  const juego = req.nextUrl.searchParams.get("juego") ?? "";
  if (!esSlugValido(juego)) {
    return NextResponse.json({ error: "Juego desconocido." }, { status: 400 });
  }

  try {
    const cartas = await consultar<Carta>(
      `SELECT id, juego_slug, tipo, texto, activa
         FROM cartas
        WHERE juego_slug = ?
        ORDER BY tipo IS NULL DESC, tipo ASC, id DESC`,
      [juego],
    );
    return NextResponse.json({ cartas });
  } catch (error) {
    console.error("[admin/cartas GET]", error);
    return NextResponse.json({ error: "No se pudo leer la base de datos." }, { status: 503 });
  }
}

/** POST /api/admin/cartas → agrega una carta. */
export async function POST(req: NextRequest) {
  if (!hayAdminEnRequest(req)) {
    return NextResponse.json({ error: "Necesitás iniciar sesión." }, { status: 401 });
  }

  const cuerpo = await req.json().catch(() => ({}));
  const juego = String(cuerpo.juego ?? "");
  const texto = String(cuerpo.texto ?? "").trim();
  const tipo = cuerpo.tipo ? String(cuerpo.tipo) : null;

  if (!esSlugValido(juego)) {
    return NextResponse.json({ error: "Juego desconocido." }, { status: 400 });
  }
  if (texto.length < 4) {
    return NextResponse.json({ error: "Escribí el texto de la carta." }, { status: 400 });
  }
  if (juego === "verdad-o-reto" && !TIPOS_VALIDOS.includes(tipo ?? "")) {
    return NextResponse.json({ error: "Elegí si es verdad o reto." }, { status: 400 });
  }

  try {
    const resultado = await ejecutar(
      "INSERT INTO cartas (juego_slug, tipo, texto) VALUES (?, ?, ?)",
      [juego, juego === "verdad-o-reto" ? tipo : null, texto],
    );
    return NextResponse.json({ id: resultado.insertId }, { status: 201 });
  } catch (error) {
    console.error("[admin/cartas POST]", error);
    return NextResponse.json({ error: "No se pudo guardar la carta." }, { status: 503 });
  }
}
