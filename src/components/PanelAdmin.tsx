"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Carta, Juego, SlugJuego } from "@/lib/tipos";

export function PanelAdmin({ juegos }: { juegos: Juego[] }) {
  const router = useRouter();
  const [juego, setJuego] = useState<SlugJuego>(juegos[0].slug);
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [tipo, setTipo] = useState<"verdad" | "reto">("verdad");
  const [guardando, setGuardando] = useState(false);

  const esVerdadOReto = juego === "verdad-o-reto";
  const actual = juegos.find((j) => j.slug === juego)!;

  const traer = useCallback(async (slug: SlugJuego) => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/cartas?juego=${slug}`, { cache: "no-store" });
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error ?? "No se pudieron traer las cartas.");
      setCartas(datos.cartas as Carta[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al traer las cartas.");
      setCartas([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    traer(juego);
  }, [juego, traer]);

  async function agregar() {
    const limpio = texto.trim();
    if (limpio.length < 4) {
      setError("Escribí el texto de la carta.");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/cartas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ juego, texto: limpio, tipo: esVerdadOReto ? tipo : null }),
      });
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error ?? "No se pudo guardar.");
      setTexto("");
      await traer(juego);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  async function alternar(carta: Carta) {
    const activa = !carta.activa;
    setCartas((lista) => lista.map((c) => (c.id === carta.id ? { ...c, activa } : c)));
    const res = await fetch(`/api/admin/cartas/${carta.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activa }),
    });
    if (!res.ok) {
      setError("No se pudo actualizar la carta.");
      traer(juego);
    }
  }

  async function borrar(carta: Carta) {
    if (!confirm("¿Borrar esta carta para siempre?")) return;
    setCartas((lista) => lista.filter((c) => c.id !== carta.id));
    const res = await fetch(`/api/admin/cartas/${carta.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("No se pudo borrar la carta.");
      traer(juego);
    }
  }

  async function salir() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  const activas = cartas.filter((c) => c.activa).length;

  return (
    <div className="contenedor pb-16 pt-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Preveo · administración</p>
          <h1 className="mt-1.5 font-display text-[22px] font-bold">Contenido de los juegos</h1>
        </div>
        <button onClick={salir} className="btn-secundario px-3 py-2 text-[12.5px]">
          Salir
        </button>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Juegos">
        {juegos.map((j) => (
          <button
            key={j.slug}
            onClick={() => setJuego(j.slug)}
            className={`rounded-full border px-3.5 py-2 font-display text-[12.5px] font-semibold transition ${
              j.slug === juego
                ? "border-ambar/70 bg-ambar/12 text-ambarsoft"
                : "border-line bg-panel text-mute hover:text-texto"
            }`}
          >
            {j.emoji} {j.nombre}
          </button>
        ))}
      </nav>

      <section className="tarjeta mt-6 p-4">
        <h2 className="font-display text-[15px] font-semibold">Agregar carta a {actual.nombre}</h2>

        {esVerdadOReto && (
          <div className="mt-3 flex gap-2">
            {(["verdad", "reto"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                className={`flex-1 rounded-xl border px-3 py-2 font-display text-[13px] font-semibold capitalize transition ${
                  tipo === t
                    ? "border-ambar/70 bg-ambar/12 text-ambarsoft"
                    : "border-line text-mute hover:text-texto"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <textarea
          className="campo mt-3 min-h-[92px] resize-y"
          placeholder="Escribí la carta..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />

        <p className="mt-2 text-[11.5px] leading-relaxed text-mute">
          Comodines: <code className="text-ambar">{"{jugador}"}</code>{" "}
          <code className="text-ambar">{"{otro}"}</code>{" "}
          <code className="text-ambar">{"{equipoA}"}</code>{" "}
          <code className="text-ambar">{"{equipoB}"}</code> — se reemplazan por nombres reales al
          jugar.
        </p>

        {error && <p className="mt-3 text-[13px] text-red-400">{error}</p>}

        <button
          onClick={agregar}
          disabled={guardando || texto.trim().length < 4}
          className="btn-principal mt-3 w-full"
        >
          {guardando ? "Guardando..." : "Agregar carta"}
        </button>
      </section>

      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="eyebrow">Cartas cargadas</h2>
          <span className="text-[12px] text-mute">
            {activas} activas de {cartas.length}
          </span>
        </div>

        {cargando ? (
          <p className="mt-4 text-[13.5px] text-mute">Cargando...</p>
        ) : cartas.length === 0 ? (
          <p className="mt-4 text-[13.5px] text-mute">
            Todavía no hay cartas en este juego. Agregá la primera arriba.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {cartas.map((carta) => (
              <li
                key={carta.id}
                className={`tarjeta flex items-start gap-3 p-3 ${carta.activa ? "" : "opacity-50"}`}
              >
                <div className="min-w-0 flex-1">
                  {carta.tipo && (
                    <span className="font-display text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ambar/80">
                      {carta.tipo}
                    </span>
                  )}
                  <p className="mt-0.5 text-[13.5px] leading-snug">{carta.texto}</p>
                </div>
                <button
                  onClick={() => alternar(carta)}
                  className="shrink-0 rounded-lg border border-line px-2.5 py-1.5 text-[11.5px] text-mute transition hover:text-texto"
                  title={carta.activa ? "Sacar del juego" : "Volver a activar"}
                >
                  {carta.activa ? "Pausar" : "Activar"}
                </button>
                <button
                  onClick={() => borrar(carta)}
                  className="shrink-0 rounded-lg border border-line px-2.5 py-1.5 text-[11.5px] text-mute transition hover:border-red-500/40 hover:text-red-400"
                  title="Borrar"
                >
                  Borrar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link href="/" className="btn-fantasma mt-10 w-full text-[13px]">
        ← Volver al juego
      </Link>
    </div>
  );
}
