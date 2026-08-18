-- Preveo · esquema de base de datos
-- Ejecutar con: mysql -u root -p < db/schema.sql   (o `npm run db:setup`)

CREATE DATABASE IF NOT EXISTS preveo
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE preveo;

CREATE TABLE IF NOT EXISTS juegos (
  slug        VARCHAR(40)  NOT NULL PRIMARY KEY,
  nombre      VARCHAR(60)  NOT NULL,
  emoji       VARCHAR(16)  NOT NULL,
  bajada      VARCHAR(120) NOT NULL,
  orden       TINYINT      NOT NULL DEFAULT 0,
  activo      TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Una sola tabla para todo el contenido de todos los juegos.
-- `tipo` sirve para los juegos que necesitan subcategorías:
--   verdad-o-reto -> 'verdad' | 'reto'
--   el resto      -> NULL
-- En `texto` se pueden usar comodines que la app reemplaza en vivo:
--   {jugador} {otro} {equipoA} {equipoB}
CREATE TABLE IF NOT EXISTS cartas (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  juego_slug  VARCHAR(40)  NOT NULL,
  tipo        VARCHAR(20)  DEFAULT NULL,
  texto       TEXT         NOT NULL,
  activa      TINYINT(1)   NOT NULL DEFAULT 1,
  creada_en   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cartas_juego FOREIGN KEY (juego_slug)
    REFERENCES juegos (slug) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_juego_activa (juego_slug, activa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO juegos (slug, nombre, emoji, bajada, orden) VALUES
  ('yo-nunca-nunca',        'Yo Nunca Nunca',        '🙈', 'Si lo hiciste, tomás',        1),
  ('verdad-o-reto',         'Verdad o Reto',         '🎭', 'Elegí o tomá',                2),
  ('quien-es-mas-probable', '¿Quién es más probable?', '🤔', 'Voten y el perdedor toma',  3),
  ('guerra-de-equipos',     'Guerra de Equipos',     '⚔️', 'El equipo que pierde, toma',  4),
  ('desafios',              'Desafíos',              '⚡', 'Cumplí o tomá',               5)
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre), emoji = VALUES(emoji), bajada = VALUES(bajada), orden = VALUES(orden);
