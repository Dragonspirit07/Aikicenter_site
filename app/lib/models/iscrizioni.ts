import { pool } from "../db";
import { RowDataPacket } from "mysql2";

export interface IscrizioneRow extends RowDataPacket {
  id:            number;
  nome:          string;
  cognome:       string;
  email:         string;
  password_hash: string;
  telefono:      string;
  data_nascita:  string;
}

export interface IscrizioneInput {
  nome:         string;
  cognome:      string;
  email:        string;
  password_hash: string;
  telefono:     string;
  data_nascita: string;
}

export async function findByEmail(email: string): Promise<IscrizioneRow | null> {
  const [rows] = await pool.query<IscrizioneRow[]>(
    "SELECT id, nome, cognome, email, password_hash, telefono, data_nascita FROM iscrizioni WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0] ?? null;
}

export async function createIscrizione(data: IscrizioneInput): Promise<number> {
  const [result] = await pool.execute(
    "INSERT INTO iscrizioni (nome, cognome, email, password_hash, telefono, data_nascita) VALUES (?, ?, ?, ?, ?, ?)",
    [data.nome, data.cognome, data.email, data.password_hash, data.telefono, data.data_nascita]
  );
  return result.insertId;
}

export async function getIscrizioneById(id: number): Promise<Omit<IscrizioneRow, "password_hash"> | null> {
  const [rows] = await pool.query<(Omit<IscrizioneRow, "password_hash"> & RowDataPacket)[]>(
    "SELECT id, nome, cognome, email, telefono, data_nascita FROM iscrizioni WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] ?? null;
}

export async function getLezioniIscrizione(idIscrizione: number): Promise<number[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id_lezione FROM iscrizioni_lezioni WHERE id_iscrizione = ?",
    [idIscrizione]
  );
  return rows.map((r) => r.id_lezione);
}

export async function addLezioneIscrizione(idIscrizione: number, idLezione: number): Promise<boolean> {
  const [result] = await pool.execute(
    "INSERT IGNORE INTO iscrizioni_lezioni (id_iscrizione, id_lezione) VALUES (?, ?)",
    [idIscrizione, idLezione]
  );
  return result.affectedRows > 0;
}

export async function removeLezioneIscrizione(idIscrizione: number, idLezione: number): Promise<boolean> {
  const [result] = await pool.execute(
    "DELETE FROM iscrizioni_lezioni WHERE id_iscrizione = ? AND id_lezione = ?",
    [idIscrizione, idLezione]
  );
  return result.affectedRows > 0;
}

export async function deleteIscrizione(id: number): Promise<boolean> {
  const [result] = await pool.execute("DELETE FROM iscrizioni WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function getAllIscrizioni(): Promise<(Omit<IscrizioneRow, "password_hash"> & RowDataPacket)[]> {
  const [rows] = await pool.query<(Omit<IscrizioneRow, "password_hash"> & RowDataPacket)[]>(
    "SELECT id, nome, cognome, email, telefono, data_nascita FROM iscrizioni ORDER BY cognome, nome"
  );
  return rows;
}

export interface IscrizioneConLezioni extends RowDataPacket {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  data_nascita: string;
  id_lezione: number;
  giorno_settimana: string;
  orario_inizio: string;
  orario_fine: string;
  nome_corso: string;
  colore: string;
}

export async function getAllIscrizioniConLezioni(): Promise<IscrizioneConLezioni[]> {
  const [rows] = await pool.query<IscrizioneConLezioni[]>(`
    SELECT
      i.id, i.nome, i.cognome, i.email, i.telefono, i.data_nascita,
      l.id_lezione, l.giorno_settimana, l.orario_inizio, l.orario_fine,
      c.nome AS nome_corso, c.colore
    FROM iscrizioni i
    LEFT JOIN iscrizioni_lezioni il ON il.id_iscrizione = i.id
    LEFT JOIN lezioni l ON l.id_lezione = il.id_lezione
    LEFT JOIN corsi c ON c.id = l.id_corso
    ORDER BY i.cognome, i.nome, l.giorno_settimana, l.orario_inizio
  `);
  return rows;
}


