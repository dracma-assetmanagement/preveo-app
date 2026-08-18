# Preveo 🍻

El juego definitivo para las juntadas. Next.js + MySQL.

Cinco modos (Yo Nunca Nunca, Verdad o Reto, ¿Quién es más probable?, Guerra de Equipos y
Desafíos), turnos que respetan el orden en que se cargaron los jugadores, y un panel en `/admin`
para cargar y borrar contenido sin tocar la base a mano.

## Arrancar

Necesitás Node 20+ y un MySQL 8 (o MariaDB 10.6+) andando.

```bash
npm install
cp .env.example .env      # editá usuario y contraseña de MySQL
npm run db:setup          # crea la base "preveo", las tablas y carga 77 cartas
npm run dev               # http://localhost:3000
```

`npm run db:setup` es seguro de correr varias veces: si ya hay cartas cargadas no vuelve a
insertar el seed. Con `-- --forzar` lo inserta igual y con `-- --solo-esquema` no toca el
contenido.

Para producción: `npm run build && npm start`.

## Variables de entorno

| Variable | Para qué |
| --- | --- |
| `MYSQL_HOST` / `MYSQL_PORT` / `MYSQL_USER` / `MYSQL_PASSWORD` / `MYSQL_DATABASE` | Conexión a la base |
| `MYSQL_SOCKET` | Opcional, si tu MySQL escucha por socket Unix en vez de TCP |
| `ADMIN_PASSWORD` | Clave del panel. Por defecto `noputas` |
| `ADMIN_SECRET` | Firma la cookie de sesión del admin. **Cambiala antes de subirlo a un servidor** |

## Cómo se juega

1. **Armado.** Se agregan los jugadores con el `+`. El número al costado es el orden de turnos y
   se mantiene toda la partida; las flechas ↑↓ lo reacomodan antes de empezar.
2. **Modos.** Se pueden elegir varios. En cada ronda sale uno al azar (nunca dos veces el mismo
   seguido si hay alternativa).
3. **Equipos.** Si entre los modos elegidos está Guerra de Equipos, aparece una pantalla para
   repartir a cada jugador en un equipo, ponerles nombre, o repartirlos al azar. Los equipos
   quedan fijos y el panel lleva el puntaje.
4. **Ronda.** Verdad o Reto pide primero que el jugador elija; los demás modos muestran la carta
   directamente. "Otra carta de este modo" saca una nueva sin cambiar de juego ni de turno.

Las cartas no se repiten hasta que se agotó el mazo de ese juego: recién ahí se vuelve a mezclar.

## Panel de administración

Está en `/admin` — no hay ningún link hacia ahí desde el juego y la página se marca como
`noindex`. Se entra con la clave (`ADMIN_PASSWORD`, por defecto `noputas`), que deja una cookie
firmada y `httpOnly` por 8 horas.

Desde ahí se puede agregar, pausar y borrar cartas de cada juego. **Pausar** la saca del sorteo
sin borrarla, útil para retos que quedaron pesados sin perder el texto.

En el texto de las cartas se pueden usar estos comodines, que se reemplazan por nombres reales al
jugar:

| Comodín | Se reemplaza por |
| --- | --- |
| `{jugador}` | El jugador al que le toca el turno |
| `{otro}` | Otro jugador cualquiera de la ronda |
| `{equipoA}` / `{equipoB}` | Los nombres de los equipos |

## Estructura

```
db/schema.sql            tablas juegos + cartas
db/seed.sql              contenido inicial de los cinco juegos
scripts/setup-db.mjs     corre schema y seed
src/lib/db.ts            pool de MySQL (mysql2)
src/lib/auth.ts          clave y cookie firmada del admin
src/lib/motor.ts         mazos, sorteo de modo, comodines (lógica pura)
src/lib/tipos.ts         tipos + catálogo de respaldo si la base no responde
src/app/page.tsx         home (lee los juegos de MySQL)
src/app/admin/page.tsx   login o panel según la cookie
src/app/api/…            cartas públicas y CRUD del admin
src/components/…         Armado, Equipos, Ronda, PanelAdmin
```

Todo el contenido vive en una sola tabla `cartas`. La columna `tipo` solo la usa Verdad o Reto
(`verdad` / `reto`); para el resto queda en `NULL`. Si MySQL no responde, la home igual carga con
el catálogo de respaldo de `src/lib/tipos.ts` y avisa recién al intentar arrancar la partida.

## Agregar un juego nuevo

1. `INSERT` en `juegos` (slug, nombre, emoji, bajada, orden).
2. Sumá el slug al tipo `SlugJuego` y al array `JUEGOS` en `src/lib/tipos.ts`.
3. Si necesita una mecánica propia (como los equipos), agregá el caso en `src/components/Ronda.tsx`.

Si el juego solo muestra una carta y pasa el turno, con los dos primeros pasos alcanza.

## Antes de subirlo a un servidor

Cambiá `ADMIN_SECRET` por una cadena larga y aleatoria, y `ADMIN_PASSWORD` por algo que no esté en
este repo. Serví siempre por HTTPS: la cookie del admin se marca `secure` en producción.
