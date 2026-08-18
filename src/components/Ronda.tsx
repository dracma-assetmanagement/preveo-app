"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Marca } from "./Marca";
import {
  Mazos,
  alAzar,
  esPorEquipos,
  resolverTexto,
  sortearJuego,
  type Equipos,
  type Ronda as RondaTipo,
} from "@/lib/motor";
import type { Carta, Juego, SlugJuego } from "@/lib/tipos";

/** Lo que dura el flasheo de modos antes de mostrar la carta. */
const RULETA_MS = 280;
/** Cada cuánto cambia el modo que se ve durante el flasheo. */
const PASO_MS = 70;

type Props = {
  jugadores: string[];
  juegos: Juego[];
  cartas: Carta[];
  equipos: Equipos | null;
  onSalir: () => void;
};

export function Ronda({ jugadores, juegos, cartas, equipos, onSalir }: Props) {
  const mazos = useMemo(() => new Mazos(cartas), [cartas]);

  // Un juego sin cartas cargadas no puede salir sorteado.
  const disponibles = useMemo(
    () =>
      juegos.filter((juego) =>
        juego.slug === "verdad-o-reto"
          ? mazos.hay("verdad-o-reto", "verdad") || mazos.hay("verdad-o-reto", "reto")
          : mazos.hay(juego.slug),
      ),
    [juegos, mazos],
  );

  const [ronda, setRonda] = useState<RondaTipo | null>(null);
  const [sorteando, setSorteando] = useState(true);
  const [destello, setDestello] = useState<Juego | null>(disponibles[0] ?? null);
  const [puntos, setPuntos] = useState({ a: 0, b: 0 });

  const turno = useRef(0);
  const nro = useRef(0);
  const ultimoJuego = useRef<SlugJuego | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const armar = useCallback((): RondaTipo | null => {
    if (disponibles.length === 0) return null;

    const juego = sortearJuego(disponibles, ultimoJuego.current);
    ultimoJuego.current = juego.slug;
    nro.current += 1;

    const porEquipos = esPorEquipos(juego.slug) && !!equipos;
    let jugador: string | null = null;
    let siguiente: string | null = null;

    if (!porEquipos) {
      jugador = jugadores[turno.current % jugadores.length];
      siguiente = jugadores[(turno.current + 1) % jugadores.length];
      turno.current += 1;
    }

    const otro = alAzar(jugadores.filter((j) => j !== jugador)) ?? null;

    if (juego.slug === "verdad-o-reto") {
      return {
        nro: nro.current,
        juego,
        jugador,
        siguiente,
        carta: null,
        texto: `${jugador}, ¿verdad o reto?`,
        esperandoEleccion: true,
      };
    }

    const carta = mazos.sacar(juego.slug);
    return {
      nro: nro.current,
      juego,
      jugador,
      siguiente,
      carta,
      texto: carta ? resolverTexto(carta.texto, { jugador, otro, equipos }) : "",
      esperandoEleccion: false,
    };
  }, [disponibles, equipos, jugadores, mazos]);

  const siguiente = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;

    // Con un solo modo no hay nada que sortear: vamos derecho a la carta.
    if (disponibles.length < 2) {
      setRonda(armar());
      setSorteando(false);
      return;
    }

    setSorteando(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setRonda(armar());
      setSorteando(false);
    }, RULETA_MS);
  }, [armar, disponibles.length]);

  // La primera ronda se arma una sola vez, al montar.
  const arrancar = useRef(siguiente);
  arrancar.current = siguiente;
  useEffect(() => {
    arrancar.current();
    return () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    };
  }, []);

  // Ruleta de modos mientras se sortea.
  useEffect(() => {
    if (!sorteando || disponibles.length < 2) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setDestello(disponibles[i % disponibles.length]);
    }, PASO_MS);
    return () => clearInterval(id);
  }, [sorteando, disponibles]);

  function elegir(tipo: "verdad" | "reto") {
    if (!ronda) return;
    const carta = mazos.sacar("verdad-o-reto", tipo);
    const otro = alAzar(jugadores.filter((j) => j !== ronda.jugador)) ?? null;
    setRonda({
      ...ronda,
      carta,
      esperandoEleccion: false,
      texto: carta
        ? resolverTexto(carta.texto, { jugador: ronda.jugador, otro, equipos })
        : `No hay cartas de ${tipo} cargadas todavía. Cargalas desde /admin.`,
    });
  }

  function otraCarta() {
    if (!ronda || ronda.esperandoEleccion) return;
    const carta = mazos.sacar(ronda.juego.slug, ronda.carta?.tipo ?? null);
    if (!carta) return;
    const otro = alAzar(jugadores.filter((j) => j !== ronda.jugador)) ?? null;
    setRonda({
      ...ronda,
      carta,
      texto: resolverTexto(carta.texto, { jugador: ronda.jugador, otro, equipos }),
    });
  }

  function anotar(lado: "a" | "b") {
    setPuntos((p) => ({ ...p, [lado]: p[lado] + 1 }));
    siguiente();
  }

  if (disponibles.length === 0) {
    return (
      <div className="contenedor flex min-h-dvh flex-col items-center justify-center text-center">
        <p className="text-[40px]">🫙</p>
        <h1 className="mt-4 font-display text-[22px] font-bold">No hay cartas cargadas</h1>
        <p className="mt-2 max-w-[340px] text-[14px] leading-relaxed text-mute">
          Los modos que elegiste están vacíos. Entrá a <span className="text-ambar">/admin</span> y
          cargá contenido, o elegí otros modos.
        </p>
        <button onClick={onSalir} className="btn-secundario mt-7 w-full max-w-[280px]">
          Volver al armado
        </button>
      </div>
    );
  }

  const porEquipos = !!ronda && esPorEquipos(ronda.juego.slug) && !!equipos;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="contenedor flex items-center justify-between pb-2 pt-6">
        <Marca compacta />
        <div className="flex items-center gap-3">
          {equipos && (
            <span className="font-display text-[12px] font-semibold text-mute">
              {puntos.a} <span className="text-mute/50">–</span> {puntos.b}
            </span>
          )}
          <span className="text-[12px] text-mute/70">Ronda {ronda?.nro ?? 1}</span>
          <button
            onClick={onSalir}
            className="h-8 w-8 rounded-full border border-line text-mute transition hover:border-ambar/40 hover:text-texto"
            aria-label="Terminar la partida"
          >
            ✕
          </button>
        </div>
      </header>

      <main className="contenedor flex flex-1 flex-col justify-center py-8">
        {sorteando || !ronda ? (
          <div className="text-center">
            <p className="eyebrow animate-latir">Sorteando modo</p>
            <p className="mt-6 text-[54px] leading-none">{destello?.emoji ?? "🎲"}</p>
            <p className="mt-4 font-display text-[19px] font-semibold text-mute">
              {destello?.nombre ?? "..."}
            </p>
          </div>
        ) : (
          <div key={ronda.nro} className="animate-subir">
            <div className="flex items-center justify-center gap-2">
              <span className="text-[15px]">{ronda.juego.emoji}</span>
              <span className="eyebrow text-ambar/90">{ronda.juego.nombre}</span>
            </div>

            {porEquipos ? (
              <div className="mt-6 grid grid-cols-2 gap-3">
                {(
                  [
                    [equipos!.nombreA, equipos!.a, puntos.a],
                    [equipos!.nombreB, equipos!.b, puntos.b],
                  ] as const
                ).map(([nombre, integrantes, tantos]) => (
                  <div key={nombre} className="tarjeta px-3 py-3 text-center">
                    <p className="font-display text-[14px] font-semibold text-ambar">{nombre}</p>
                    <p className="mt-1 text-[11.5px] leading-snug text-mute">
                      {integrantes.join(" · ")}
                    </p>
                    <p className="mt-2 font-display text-[13px] font-semibold">{tantos} pts</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-center">
                <span className="block text-[12px] uppercase tracking-[0.18em] text-mute">
                  Le toca a
                </span>
                <span className="mt-1.5 block font-display text-[27px] font-bold text-ambar">
                  {ronda.jugador}
                </span>
              </p>
            )}

            <div className="tarjeta mt-6 bg-panel2 px-6 py-9">
              <p className="text-center font-display text-[21px] font-semibold leading-[1.35]">
                {ronda.texto}
              </p>
              {!ronda.esperandoEleccion && (
                <p className="mt-5 text-center text-[12.5px] text-mute">{ronda.juego.bajada}</p>
              )}
            </div>

            {!porEquipos && ronda.siguiente && (
              <p className="mt-4 text-center text-[12px] text-mute/70">
                Después sigue {ronda.siguiente}
              </p>
            )}
          </div>
        )}
      </main>

      <footer className="contenedor space-y-3 pb-8 pt-2">
        {ronda && !sorteando && ronda.esperandoEleccion ? (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => elegir("verdad")} className="btn-secundario py-5">
              🗣️ Verdad
            </button>
            <button onClick={() => elegir("reto")} className="btn-principal py-5">
              🔥 Reto
            </button>
          </div>
        ) : porEquipos ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => anotar("a")} className="btn-principal py-5 text-[14px]">
                Ganó {equipos!.nombreA}
              </button>
              <button onClick={() => anotar("b")} className="btn-principal py-5 text-[14px]">
                Ganó {equipos!.nombreB}
              </button>
            </div>
            <button onClick={siguiente} className="btn-fantasma w-full text-[13px]">
              Empate, seguir
            </button>
          </>
        ) : (
          <>
            <button onClick={siguiente} disabled={sorteando} className="btn-principal w-full py-5">
              Siguiente
            </button>
            <button
              onClick={otraCarta}
              disabled={sorteando || !ronda || ronda.esperandoEleccion}
              className="btn-fantasma w-full text-[13px]"
            >
              Otra carta de este modo
            </button>
          </>
        )}
      </footer>
    </div>
  );
}
