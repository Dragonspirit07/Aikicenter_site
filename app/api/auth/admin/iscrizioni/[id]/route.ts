import { NextResponse } from "next/server";
import { deleteIscrizione } from "@/lib/models/iscrizioni";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteIscrizione(Number(id));
    if (!deleted)
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