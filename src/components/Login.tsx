"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function Login() {
  const router = useRouter();
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar() {
    if (!clave) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clave }),
      });
      if (!res.ok) {
        const datos = await res.json().catch(() => ({}));
        setError(datos.error ?? "No se pudo entrar.");
        return;
      }
      setClave("");
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="contenedor flex min-h-dvh flex-col justify-center">
      <div className="tarjeta px-6 py-8">
        <p className="eyebrow">Preveo · administración</p>
        <h1 className="mt-2 font-display text-[22px] font-bold">Cargar y borrar cartas</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-mute">
          Ingresá la clave para editar el contenido de los juegos.
        </p>

        <input
          type="password"
          className="campo mt-6"
          placeholder="Clave"
          value={clave}
          autoComplete="current-password"
          onChange={(e) => setClave(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") entrar();
          }}
          aria-label="Clave de administración"
        />

        {error && <p className="mt-3 text-[13px] text-red-400">{error}</p>}

        <button
          onClick={entrar}
          disabled={enviando || !clave}
          className="btn-principal mt-4 w-full"
        >
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}
