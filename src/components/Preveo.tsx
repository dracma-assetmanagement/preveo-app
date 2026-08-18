"use client";

import { useEffect, useMemo, useState } from "react";
import { Armado } from "./Armado";
import { Equipos } from "./Equipos";
import { Ronda } from "./Ronda";
import type { Equipos as EquiposTipo } from "@/lib/motor";
import { JUEGO_POR_EQUIPOS, esSlugValido, type Carta, type Juego, type SlugJuego } from "@/lib/tipos";

type Paso = "armado" | "equipos" | "jugando";
const GUARDADO = "preveo:ronda";

export function Preveo({ juegos }: { juegos: (Juego & { cartas?: number })[] }) {
  const [paso, setPaso] = useState<Paso>("armado");
  const [jugadores, setJugadores] = useState<string[]>([]);
  const [elegidos, setElegidos] = useState<SlugJuego[]>([]);
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [equipos, setEquipos] = useState<EquiposTipo | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recuperamos la última ronda armada para no volver a tipear los nombres.
  useEffect(() => {
    try {
      const crudo = localStorage.getItem(GUARDADO);
      if (!crudo) return;
      const datos = JSON.parse(crudo) as { jugadores?: unknown; elegidos?: unknown };
      if (Array.isArray(datos.jugadores)) {
        setJugadores(datos.jugadores.filter((j): j is string => typeof j === "string").slice(0, 20));
      }
      if (Array.isArray(datos.elegidos)) {
        setElegidos(datos.elegidos.filter((s): s is SlugJuego => typeof s === "string" && esSlugValido(s)));
      }
    } catch {
      // Si el storage está bloqueado, seguimos sin memoria y listo.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(GUARDADO, JSON.stringify({ jugadores, elegidos }));
    } catch {
      /* sin persistencia */
    }
  }, [jugadores, elegidos]);

  async function empezar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/cartas?juegos=${elegidos.join(",")}`, { cache: "no-store" });
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error ?? "No se pudieron traer las cartas.");
      if (!datos.cartas?.length) {
        throw new Error("Los modos elegidos no tienen cartas cargadas. Entrá a /admin y cargá algunas.");
      }
      setCartas(datos.cartas as Carta[]);
      setEquipos(null);
      setPaso(elegidos.includes(JUEGO_POR_EQUIPOS) ? "equipos" : "jugando");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Algo falló al traer las cartas.");
    } finally {
      setCargando(false);
    }
  }

  // Memorizado: si cambiara de identidad en cada render, Ronda rearmaría los
  // mazos y perdería el sorteo en curso.
  const seleccionados = useMemo(
    () => juegos.filter((j) => elegidos.includes(j.slug)),
    [juegos, elegidos],
  );

  if (paso === "equipos") {
    return (
      <Equipos
        jugadores={jugadores}
        onVolver={() => setPaso("armado")}
        onListo={(armados) => {
          setEquipos(armados);
          setPaso("jugando");
        }}
      />
    );
  }

  if (paso === "jugando") {
    return (
      <Ronda
        jugadores={jugadores}
        juegos={seleccionados}
        cartas={cartas}
        equipos={equipos}
        onSalir={() => setPaso("armado")}
      />
    );
  }

  return (
    <Armado
      juegos={juegos}
      jugadores={jugadores}
      setJugadores={setJugadores}
      elegidos={elegidos}
      setElegidos={setElegidos}
      onEmpezar={empezar}
      cargando={cargando}
      error={error}
    />
  );
}
