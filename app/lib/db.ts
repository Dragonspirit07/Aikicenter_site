import mysql from "mysql2/promise";

// Compatibile con ambienti serverless (Vercel) e sviluppo locale
const globalForDb = global as typeof global & { _mysqlPool?: mysql.Pool };

function createPool(): mysql.Pool {
  const host     = process.env.DB_HOST;
  const user     = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (!host || !user || !database) {
    throw new Error(
      "Missing required DB environment variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME"
    );
  }

  const port = Number(process.env.DB_PORT ?? 3306);
  if (isNaN(port)) {
    throw new Error("Invalid DB_PORT: must be a number");
  }

  // SSL abilitato solo in produzione (necessario per Aiven e altri provider cloud)
  const ssl =
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined;

  return mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    ssl,
    waitForConnections: true,
    // In serverless ogni function ha poche connessioni parallele:
    // un valore basso evita di esaurire i limiti del piano gratuito
    connectionLimit: process.env.NODE_ENV === "production" ? 2 : 10,
    queueLimit: 0,
  });
}

// Singleton: riusa il pool tra gli hot-reload di Next.js in sviluppo
// e tra le invocazioni della stessa Lambda/Edge function in produzione
function getPool(): mysql.Pool {
  if (!globalForDb._mysqlPool) {
    globalForDb._mysqlPool = createPool();
  }
  return globalForDb._mysqlPool;
}

export function getRawPool(): mysql.Pool {
  return getPool();
}

export const pool = {
  query<T extends mysql.RowDataPacket[]>(
    sql: string,
    values?: unknown[]
  ): Promise<[T, mysql.FieldPacket[]]> {
    return getPool().query<T>(
      sql,
      values as (string | number | boolean | null | Buffer | Date)[]
    );
  },

  execute(
    sql: string,
    values?: unknown[]
  ): Promise<[mysql.ResultSetHeader, mysql.FieldPacket[]]> {
    return getPool().execute(
      sql,
      values as (string | number | boolean | null | Buffer | Date)[]
    ) as Promise<[mysql.ResultSetHeader, mysql.FieldPacket[]]>;
  },
};