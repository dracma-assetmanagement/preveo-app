import mysql from "mysql2/promise";

// En dev, Next recarga los módulos en cada cambio: guardamos el pool en global
// para no abrir una conexión nueva por recarga.
const global_ = globalThis as unknown as { poolPreveo?: mysql.Pool };

export function pool(): mysql.Pool {
  if (!global_.poolPreveo) {
    global_.poolPreveo = mysql.createPool({
      // MYSQL_SOCKET es opcional: sirve cuando MySQL escucha por socket Unix
      // (típico en instalaciones locales de Linux/macOS) en lugar de TCP.
      ...(process.env.MYSQL_SOCKET ? { socketPath: process.env.MYSQL_SOCKET } : {}),
      host: process.env.MYSQL_HOST ?? "127.0.0.1",
      port: Number(process.env.MYSQL_PORT ?? 3306),
      user: process.env.MYSQL_USER ?? "root",
      password: process.env.MYSQL_PASSWORD ?? "",
      database: process.env.MYSQL_DATABASE ?? "preveo",
      waitForConnections: true,
      connectionLimit: 10,
      charset: "utf8mb4",
    });
  }
  return global_.poolPreveo;
}

export async function consultar<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [filas] = await pool().query(sql, params);
  return filas as T[];
}

export async function ejecutar(sql: string, params: unknown[] = []) {
  const [resultado] = await pool().query(sql, params);
  return resultado as mysql.ResultSetHeader;
}
