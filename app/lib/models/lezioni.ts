import { pool } from "../db";
import { RowDataPacket } from "mysql2";

// ── Tipo risultato DB ─────────────────────────────────────────────────
export interface LezioneRow extends RowDataPacket {
  id_lezione:       number;
  giorno_settimana: string;
  orario_inizio:    string;
  orario_fine:      string;
  id_corso:         number;
}
// ── Tipo risultato DB con corso ─────────────────────────────────────────────────
export interface LezioneConCorso extends RowDataPacket {
  id_lezione:       number;
  giorno_settimana: string;
  orario_inizio:    string;
  orario_fine:      string;
  id_corso:         number;
  nome_corso:       string;
  sottotitolo:      string;
  eta:              string;
  colore:           string;
}

// ── Tipo input ─────────────────────────────────────────────────
export interface LezioneInput {
  giorno_settimana: string;
  orario_inizio:    string;
  orario_fine:      string;
  id_corso:         number;
}

export async function getAllLezioni(): Promise<LezioneConCorso[]> {
  const [rows] = await pool.query<LezioneConCorso[]>(`
    SELECT
      l.id_lezione,
      l.giorno_settimana,
      l.orario_inizio,
      l.orario_fine,
      l.id_corso,
      c.nome        AS nome_corso,
      c.sottotitolo,
      c.eta,
      c.colore
    FROM lezioni l INNER JOIN corsi c ON c.id = l.id_corso
    ORDER BY
      FIELD(l.giorno_settimana,'Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'),
      l.orario_inizio
  `);
  return rows;
}

export async function getLezioniByGiorno(giorno: string): Promise<LezioneConCorso[]> {
  const [rows] = await pool.query<LezioneConCorso[]>(`
    SELECT
      l.id_lezione,
      l.giorno_settimana,
      l.orario_inizio,
      l.orario_fine,
      l.id_corso,
      c.nome        AS nome_corso,
      c.sottotitolo,
      c.eta,
      c.colore
    FROM lezioni l INNER JOIN corsi c ON c.id = l.id_corso
    WHERE l.giorno_settimana = ?
    ORDER BY l.orario_inizio
  `, [giorno]);
  return rows;
}

export async function getLezioniByCorso(idCorso: number): Promise<LezioneRow[]> {
  const [rows] = await pool.query<LezioneRow[]>(
    `SELECT * FROM lezioni WHERE id_corso = ?
     ORDER BY FIELD(giorno_settimana,'Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'), orario_inizio`,
    [idCorso]
  );
  return rows;
}

export async function getLezioneById(id: number): Promise<LezioneRow | null> {
  const [rows] = await pool.query<LezioneRow[]>(
    "SELECT * FROM lezioni WHERE id_lezione = ? LIMIT 1",
    [id]
  );
  return rows[0] ?? null;
}

export async function checkConflittoOrario(
  giorno: string, inizio: string, fine: string, excludeId?: number
): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM lezioni
     WHERE giorno_settimana = ?
       AND orario_inizio < ?
       AND ? < orario_fine
       ${excludeId ? "AND id_lezione != ?" : ""}`,
    excludeId
      ? [giorno, fine, inizio, excludeId]
      : [giorno, fine, inizio]
  );
  return rows[0].cnt > 0;
}

export async function createLezione(data: LezioneInput): Promise<boolean> {
  if (!data.giorno_settimana?.trim() || !data.orario_inizio?.trim() || !data.orario_fine?.trim()) {
    throw new Error("giorno_settimana, orario_inizio, and orario_fine are required");
  }
  if (!Number.isInteger(data.id_corso) || data.id_corso <= 0) {
    throw new Error("id_corso must be a positive integer");
  }
  if (!/^\d{2}:\d{2}$/.test(data.orario_inizio) || !/^\d{2}:\d{2}$/.test(data.orario_fine)) {
    throw new Error("orario_inizio and orario_fine must be in HH:MM format");
  }

  const conflitto = await checkConflittoOrario(
    data.giorno_settimana.trim(), data.orario_inizio.trim(), data.orario_fine.trim()
  );
  if (conflitto) {
    throw new Error("Esiste già una lezione in questo giorno e orario.");
  }

  const [result] = await pool.execute(
    "INSERT INTO lezioni (giorno_settimana, orario_inizio, orario_fine, id_corso) VALUES (?, ?, ?, ?)",
    [data.giorno_settimana.trim(), data.orario_inizio.trim(), data.orario_fine.trim(), data.id_corso]
  );
  return result.affectedRows > 0;
}

export async function updateLezione(id: number, data: Partial<LezioneInput>): Promise<boolean> {
  if (data.id_corso !== undefined && (!Number.isInteger(data.id_corso) || data.id_corso <= 0)) {
    throw new Error("id_corso must be a positive integer");
  }
  if ((data.orario_inizio && !/^\d{2}:\d{2}$/.test(data.orario_inizio)) ||
      (data.orario_fine && !/^\d{2}:\d{2}$/.test(data.orario_fine))) {
    throw new Error("orario_inizio and orario_fine must be in HH:MM format");
  }

  const giorno = data.giorno_settimana?.trim();
  const inizio = data.orario_inizio?.trim();
  const fine   = data.orario_fine?.trim();

  if (giorno && inizio && fine) {
    const conflitto = await checkConflittoOrario(giorno, inizio, fine, id);
    if (conflitto) {
      throw new Error("Esiste già una lezione in questo giorno e orario.");
    }
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.giorno_settimana !== undefined) { fields.push("giorno_settimana = ?"); values.push(giorno); }
  if (data.orario_inizio    !== undefined) { fields.push("orario_inizio = ?");    values.push(inizio); }
  if (data.orario_fine      !== undefined) { fields.push("orario_fine = ?");      values.push(fine); }
  if (data.id_corso         !== undefined) { fields.push("id_corso = ?");         values.push(data.id_corso); }

  if (fields.length === 0) return false;
  values.push(id);

  const [result] = await pool.execute(
    `UPDATE lezioni SET ${fields.join(", ")} WHERE id_lezione = ?`,
    values
  );
  return result.affectedRows > 0;
}

export async function deleteLezione(id: number): Promise<boolean> {
  const [result] = await pool.execute("DELETE FROM lezioni WHERE id_lezione = ?", [id]);
  return result.affectedRows > 0;
}