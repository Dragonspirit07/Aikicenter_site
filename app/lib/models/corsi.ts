import { pool } from "../db";
import { RowDataPacket } from "mysql2";

// ── Tipo risultato DB ─────────────────────────────────────────────────
export interface CorsoRow extends RowDataPacket {
  id:          number;
  nome:        string;
  sottotitolo: string;
  descrizione: string;
  eta:         string;
  colore:      string;
}

// ── Tipo input ─────────────────────────────────────────────────
export interface CorsoInput {
  nome:        string;
  sottotitolo: string;
  descrizione: string;
  eta:         string;
  colore:      string;
}

export async function getAllCorsi(): Promise<CorsoRow[]> {
  const [rows] = await pool.query<CorsoRow[]>(
    "SELECT id, nome, sottotitolo, descrizione, eta, colore FROM corsi ORDER BY id"
  );
  return rows;
}

export async function getCorsoById(id: number): Promise<CorsoRow | null> {
  const [rows] = await pool.query<CorsoRow[]>(
    "SELECT id, nome, sottotitolo, descrizione, eta, colore FROM corsi WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] ?? null;
}

export async function createCorso(data: CorsoInput): Promise<boolean> {
  if (!data.nome?.trim() || !data.sottotitolo?.trim() || !data.descrizione?.trim() || !data.eta?.trim()) {
    throw new Error("All fields are required and cannot be empty");
  }
  if (data.nome.length > 255 || data.sottotitolo.length > 255 || data.eta.length > 50) {
    throw new Error("Field length exceeds maximum allowed");
  }

  // Valida formato colore HEX
  const colore = /^#[0-9A-Fa-f]{6}$/.test(data.colore ?? "") ? data.colore : "#D32F2F";

  const [result] = await pool.execute(
    "INSERT INTO corsi (nome, sottotitolo, descrizione, eta, colore) VALUES (?, ?, ?, ?, ?)",
    [data.nome.trim(), data.sottotitolo.trim(), data.descrizione.trim(), data.eta.trim(), colore]
  );
  return result.affectedRows > 0;
}

export async function updateCorso(id: number, data: Partial<CorsoInput>): Promise<boolean> {
  if ((data.nome && data.nome.length > 255) ||
      (data.sottotitolo && data.sottotitolo.length > 255) ||
      (data.eta && data.eta.length > 50)) {
    throw new Error("Field length exceeds maximum allowed");
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.nome        !== undefined) { fields.push("nome = ?");        values.push(data.nome.trim()); }
  if (data.sottotitolo !== undefined) { fields.push("sottotitolo = ?"); values.push(data.sottotitolo.trim()); }
  if (data.descrizione !== undefined) { fields.push("descrizione = ?"); values.push(data.descrizione.trim()); }
  if (data.eta         !== undefined) { fields.push("eta = ?");         values.push(data.eta.trim()); }
  if (data.colore      !== undefined) {
    const colore = /^#[0-9A-Fa-f]{6}$/.test(data.colore) ? data.colore : "#D32F2F";
    fields.push("colore = ?");
    values.push(colore);
  }

  if (fields.length === 0) return false;
  values.push(id);

  const [result] = await pool.execute(
    `UPDATE corsi SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
}

export async function deleteCorso(id: number): Promise<boolean> {
  const [result] = await pool.execute("DELETE FROM corsi WHERE id = ?", [id]);
  return result.affectedRows > 0;
}