import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [result] = await pool.execute(
      "DELETE FROM iscrizioni WHERE id = ?",
      [Number(id)]
    );
    if (result.affectedRows === 0)
      return NextResponse.json({ error: "Utente non trovato." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Errore nell'eliminazione dell'utente." },
      { status: 500 }
    );
  }
}