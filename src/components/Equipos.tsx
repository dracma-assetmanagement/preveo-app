"use client";

import { useState } from "react";
import type { Equipos as EquiposTipo } from "@/lib/motor";

type Props = {
  jugadores: string[];
  onListo: (equipos: EquiposTipo) => void;
  onVolver: () => void;
};

export function Equipos({ jugadores, onListo, onVolver }: Props) {
  const mitad = Math.ceil(jugadores.length / 2);
  const [asignacion, setAsignacion] = useState<Record<string, "a" | "b">>(() =>
    Object.fromEntries(jugadores.map((j, i) => [j, i < mitad ? "a" : "b"])),
  );
  const [nombreA, setNombreA] = useState("Equipo 1");
  const [nombreB, setNombreB] = useState("Equipo 2");

  const equipoA = jugadores.filter((j) => asignacion[j] === "a");
  const equipoB = jugadores.filter((j) => asignacion[j] === "b");
  const listo = equipoA.length >= 1 && equipoB.length >= 1;

  function repartirAlAzar() {
    const mezclados = [...jugadores].sort(() => Math.random() - 0.5);
    setAsignacion(
      Object.fromEntries(mezclados.map((j, i) => [j, i % 2 === 0 ? "a" : "b"])) as Record<
        string,
        "a" | "b"
      >,
    );
  }

  return (
    <div className="contenedor pb-32 pt-12">
      <button onClick={onVolver} className="btn-fantasma -ml-4 px-4 py-2 text-[13px]">
        ← Volver
      </button>

      <header className="mt-4">
        <p className="eyebrow">Guerra de equipos</p>
        <h1 className="mt-2 font-display text-[26px] font-bold leading-tight">
          Armá los dos equipos
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-mute">
          Tocá a cada jugador para pasarlo de un lado al otro. Los equipos quedan fijos toda la
          partida.
        </p>
      </header>

      <div className="mt-7 grid grid-cols-2 gap-3">
        {(
          [
            ["a", nombreA, setNombreA, equipoA],
            ["b", nombreB, setNombreB, equipoB],
          ] as const
        ).map(([lado, nombre, setNombre, integrantes]) => (
          <div key={lado} className="tarjeta p-3">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value.slice(0, 16))}
              className="w-full rounded-xl bg-transparent px-1 py-1 font-display text-[15px] font-semibold text-ambar outline-none focus:bg-panel2"
              aria-label={`Nombre del equipo ${lado === "a" ? 1 : 2}`}
            />
            <p className="mt-1 px-1 text-[11.5px] text-mute">
              {integrantes.length} {integrantes.length === 1 ? "jugador" : "jugadores"}
            </p>
            <ul className="mt-3 space-y-2">
              {integrantes.map((jugador) => (
                <li key={jugador}>
                  <button
                    onClick={() =>
                      setAsignacion({ ...asignacion, [jugador]: lado === "a" ? "b" : "a" })
                    }
                    className="flex w-full items-center justify-between gap-2 rounded-xl border border-line bg-panel2 px-3 py-2.5 text-left text-[14px] transition hover:border-ambar/40"
                  >
                    <span className="min-w-0 truncate">{jugador}</span>
                    <span className="shrink-0 text-mute">{lado === "a" ? "→" : "←"}</span>
                  </button>
                </li>
              ))}
              {integrantes.length === 0 && (
                <li className="rounded-xl border border-dashed border-line px-3 py-4 text-center text-[12.5px] text-mute">
                  Sin jugadores
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>

      <button onClick={repartirAlAzar} className="btn-secundario mt-4 w-full">
        🎲 Repartir al azar
      </button>

      <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/95 to-transparent pb-6 pt-8">
        <div className="contenedor">
          <button
            disabled={!listo}
            onClick={() =>
              onListo({
                a: equipoA,
                b: equipoB,
                nombreA: nombreA.trim() || "Equipo 1",
                nombreB: nombreB.trim() || "Equipo 2",
              })
            }
            className="btn-principal w-full"
          >
            Arrancar
          </button>
          {!listo && (
            <p className="mt-3 text-center text-[12px] text-mute/70">
              Cada equipo necesita al menos un jugador
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
