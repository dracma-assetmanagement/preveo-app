export type SlugJuego =
  | "yo-nunca-nunca"
  | "verdad-o-reto"
  | "quien-es-mas-probable"
  | "guerra-de-equipos"
  | "desafios";

export type Juego = {
  slug: SlugJuego;
  nombre: string;
  emoji: string;
  bajada: string;
};

export type Carta = {
  id: number;
  juego_slug: SlugJuego;
  tipo: "verdad" | "reto" | null;
  texto: string;
  activa?: boolean;
};

// Catálogo de respaldo: si MySQL no responde, la pantalla de armado sigue viva.
export const JUEGOS: Juego[] = [
  { slug: "yo-nunca-nunca", nombre: "Yo Nunca Nunca", emoji: "🙈", bajada: "Si lo hiciste, tomás" },
  { slug: "verdad-o-reto", nombre: "Verdad o Reto", emoji: "🎭", bajada: "Elegí o tomá" },
  { slug: "quien-es-mas-probable", nombre: "¿Quién es más probable?", emoji: "🤔", bajada: "Voten y el perdedor toma" },
  { slug: "guerra-de-equipos", nombre: "Guerra de Equipos", emoji: "⚔️", bajada: "El equipo que pierde, toma" },
  { slug: "desafios", nombre: "Desafíos", emoji: "⚡", bajada: "Cumplí o tomá" },
];

export const SLUGS = JUEGOS.map((j) => j.slug);

export function esSlugValido(valor: string): valor is SlugJuego {
  return (SLUGS as string[]).includes(valor);
}

export function juegoPorSlug(slug: string): Juego | undefined {
  return JUEGOS.find((j) => j.slug === slug);
}

// El único juego que se juega por equipos y no por turnos individuales.
export const JUEGO_POR_EQUIPOS: SlugJuego = "guerra-de-equipos";
