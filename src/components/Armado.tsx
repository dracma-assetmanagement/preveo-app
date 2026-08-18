"use client";

import { useState } from "react";
import { Marca } from "./Marca";
import type { Juego, SlugJuego } from "@/lib/tipos";

type Props = {
  juegos: (Juego & { cartas?: number })[];
  jugadores: string[];
  setJugadores: (lista: string[]) => void;
  elegidos: SlugJuego[];
  setElegidos: (lista: SlugJuego[]) => void;
  onEmpezar: () => void;
  cargando: boolean;
  error: string | null;
};

export function Armado({
  juegos,
  jugadores,
  setJugadores,
  elegidos,
  setElegidos,
  onEmpezar,
  cargando,
  error,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);

  function agregar() {
    const limpio = nombre.trim().replace(/\s+/g, " ");
    if (!limpio) return;
    if (limpio.length > 18) {
      setAviso("Usá un nombre más corto (hasta 18 letras).");
      return;
    }
    if (jugadores.some((j) => j.toLowerCase() === limpio.toLowerCase())) {
      setAviso("Ese nombre ya está en la ronda.");
      return;
    }
    setJugadores([...jugadores, limpio]);
    setNombre("");
    setAviso(null);
  }

  function quitar(indice: number) {
    setJugadores(jugadores.filter((_, i) => i !== indice));
  }

  function mover(indice: number, direccion: -1 | 1) {
    const destino = indice + direccion;
    if (destino < 0 || destino >= jugadores.length) return;
    const copia = [...jugadores];
    [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
    setJugadores(copia);
  }

  function alternarJuego(slug: SlugJuego) {
    setElegidos(elegidos.includes(slug) ? elegidos.filter((s) => s !== slug) : [...elegidos, slug]);
  }

  const listo = jugadores.length >= 2 && elegidos.length >= 1;

  return (
    <div className="contenedor pb-32 pt-12">
      <Marca />

      <section className="mt-11">
        <h2 className="eyebrow">Jugadores</h2>
        <div className="mt-3 flex gap-3">
          <input
            className="campo"
            placeholder="Nombre del jugador..."
            value={nombre}
            maxLength={20}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                agregar();
              }
            }}
            aria-label="Nombre del jugador"
          />
          <button
            onClick={agregar}
            className="btn-secundario w-14 shrink-0 text-xl"
            aria-label="Agregar jugador"
          >
            +
          </button>
        </div>

        {jugadores.length > 0 && (
          <ul className="mt-4 space-y-2">
            {jugadores.map((jugador, i) => (
              <li
                key={jugador}
                className="tarjeta flex animate-subir items-center gap-3 px-3 py-2.5"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ambar/12 font-display text-xs font-semibold text-ambar">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-[15px]">{jugador}</span>
                <button
                  onClick={() => mover(i, -1)}
                  disabled={i === 0}
                  className="h-7 w-7 rounded-lg text-mute transition hover:text-texto disabled:opacity-25"
                  aria-label={`Subir a ${jugador}`}
                >
                  ↑
                </button>
                <button
                  onClick={() => mover(i, 1)}
                  disabled={i === jugadores.length - 1}
                  className="h-7 w-7 rounded-lg text-mute transition hover:text-texto disabled:opacity-25"
                  aria-label={`Bajar a ${jugador}`}
                >
                  ↓
                </button>
                <button
                  onClick={() => quitar(i)}
                  className="h-7 w-7 rounded-lg text-mute transition hover:text-red-400"
                  aria-label={`Quitar a ${jugador}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 text-[13px] text-mute">
          {aviso
            ? aviso
            : jugadores.length < 2
              ? "Mínimo 2 jugadores"
              : "Los turnos van a seguir este orden toda la partida."}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="eyebrow">Modos de juego</h2>
        <p className="mt-1 text-[13px] text-mute">
          Elegí todos los que quieras: en cada ronda sale uno al azar.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {juegos.map((juego) => {
            const activo = elegidos.includes(juego.slug);
            return (
              <button
                key={juego.slug}
                onClick={() => alternarJuego(juego.slug)}
                aria-pressed={activo}
                className={`tarjeta relative flex flex-col items-center px-3 py-6 text-center transition
                  ${
                    activo
                      ? "border-ambar/70 bg-panel2 shadow-[0_0_0_1px_rgba(245,166,35,0.25),0_10px_30px_-16px_rgba(245,166,35,0.5)]"
                      : "hover:border-line/80 hover:bg-panel2"
                  }`}
              >
                {activo && (
                  <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-ambar text-[11px] font-bold text-black">
                    ✓
                  </span>
                )}
                <span className="text-[30px] leading-none">{juego.emoji}</span>
                <span className="mt-3 font-display text-[15px] font-semibold leading-tight">
                  {juego.nombre}
                </span>
                <span className="mt-1.5 text-[12.5px] leading-snug text-mute">{juego.bajada}</span>
                {typeof juego.cartas === "number" && (
                  <span className="mt-2 text-[11px] text-mute/60">{juego.cartas} cartas</span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/95 to-transparent pb-6 pt-8">
        <div className="contenedor">
          {error && <p className="mb-3 text-center text-[13px] text-red-400">{error}</p>}
          <button onClick={onEmpezar} disabled={!listo || cargando} className="btn-principal w-full">
            {cargando ? "Preparando las cartas..." : "Empezar la ronda"}
          </button>
          <p className="mt-3 text-center text-[12px] text-mute/70">
            {elegidos.length === 0
              ? "Elegí al menos un modo de juego"
              : `${elegidos.length} ${elegidos.length === 1 ? "modo elegido" : "modos elegidos"}`}
          </p>
        </div>
      </div>
    </div>
  );
}
