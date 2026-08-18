import { JUEGO_POR_EQUIPOS, type Carta, type Juego, type SlugJuego } from "./tipos";

export type Equipos = { a: string[]; b: string[]; nombreA: string; nombreB: string };

export type Ronda = {
  nro: number;
  juego: Juego;
  /** Jugador al que le toca. `null` en los juegos por equipos. */
  jugador: string | null;
  siguiente: string | null;
  carta: Carta | null;
  texto: string;
  /** En Verdad o Reto arranca en true hasta que el jugador elige. */
  esperandoEleccion: boolean;
};

export function mezclar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function alAzar<T>(lista: T[]): T | undefined {
  return lista[Math.floor(Math.random() * lista.length)];
}

/**
 * Un mazo por juego: se reparte mezclado y recién cuando se agota se vuelve a
 * mezclar, así no se repite una carta hasta haber pasado por todas.
 */
export class Mazos {
  private pilas = new Map<string, Carta[]>();
  private origen = new Map<string, Carta[]>();

  constructor(cartas: Carta[]) {
    for (const carta of cartas) {
      const clave = llave(carta.juego_slug, carta.tipo);
      if (!this.origen.has(clave)) this.origen.set(clave, []);
      this.origen.get(clave)!.push(carta);
    }
    for (const [clave, lista] of this.origen) this.pilas.set(clave, mezclar(lista));
  }

  hay(slug: SlugJuego, tipo: Carta["tipo"] = null) {
    return (this.origen.get(llave(slug, tipo))?.length ?? 0) > 0;
  }

  sacar(slug: SlugJuego, tipo: Carta["tipo"] = null): Carta | null {
    const clave = llave(slug, tipo);
    const original = this.origen.get(clave);
    if (!original || original.length === 0) return null;
    let pila = this.pilas.get(clave)!;
    if (pila.length === 0) {
      pila = mezclar(original);
      this.pilas.set(clave, pila);
    }
    return pila.pop() ?? null;
  }
}

function llave(slug: string, tipo: Carta["tipo"]) {
  return tipo ? `${slug}::${tipo}` : slug;
}

/** Reemplaza los comodines de la carta por nombres reales. */
export function resolverTexto(
  texto: string,
  datos: { jugador?: string | null; otro?: string | null; equipos?: Equipos | null },
) {
  return texto
    .replaceAll("{jugador}", datos.jugador ?? "quien tenga el turno")
    .replaceAll("{otro}", datos.otro ?? "alguien de la ronda")
    .replaceAll("{equipoA}", datos.equipos?.nombreA ?? "el equipo 1")
    .replaceAll("{equipoB}", datos.equipos?.nombreB ?? "el equipo 2");
}

/** Elige el próximo juego al azar evitando repetir el anterior si hay alternativa. */
export function sortearJuego(elegidos: Juego[], anterior: SlugJuego | null): Juego {
  if (elegidos.length === 1) return elegidos[0];
  const candidatos = elegidos.filter((j) => j.slug !== anterior);
  return alAzar(candidatos.length ? candidatos : elegidos)!;
}

export function esPorEquipos(slug: SlugJuego) {
  return slug === JUEGO_POR_EQUIPOS;
}
