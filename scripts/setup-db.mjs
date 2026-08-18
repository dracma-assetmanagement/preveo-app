// Crea la base, las tablas y carga el contenido inicial.
// Uso: npm run db:setup                  (esquema + seed si la base está vacía)
//      npm run db:setup -- --solo-esquema (no toca las cartas)
//      npm run db:setup -- --forzar       (vuelve a insertar el seed aunque ya haya cartas)
import { readFile } from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import "dotenv/config";

const raiz = process.cwd();
const soloEsquema = process.argv.includes("--solo-esquema");
const forzar = process.argv.includes("--forzar");

const conexion = await mysql.createConnection({
  ...(process.env.MYSQL_SOCKET ? { socketPath: process.env.MYSQL_SOCKET } : {}),
  host: process.env.MYSQL_HOST ?? "127.0.0.1",
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: process.env.MYSQL_USER ?? "root",
  password: process.env.MYSQL_PASSWORD ?? "",
  multipleStatements: true,
});

async function correr(archivo) {
  const sql = await readFile(path.join(raiz, "db", archivo), "utf8");
  await conexion.query(sql);
  console.log(`✓ ${archivo}`);
}

try {
  await correr("schema.sql");

  if (!soloEsquema) {
    const [[{ total }]] = await conexion.query("SELECT COUNT(*) AS total FROM preveo.cartas");
    if (total > 0 && !forzar) {
      console.log(`· seed.sql omitido: ya hay ${total} cartas (usá --forzar para duplicarlas)`);
    } else {
      await correr("seed.sql");
    }
  }
  const [filas] = await conexion.query("SELECT COUNT(*) AS total FROM preveo.cartas");
  console.log(`\nListo. Cartas en la base: ${filas[0].total}`);
} catch (error) {
  console.error("\nFalló la carga:", error.message);
  process.exitCode = 1;
} finally {
  await conexion.end();
}
