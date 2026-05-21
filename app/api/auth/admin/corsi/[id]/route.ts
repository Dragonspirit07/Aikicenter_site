import { NextResponse } from "next/server";
import { getCorsoById, updateCorso, deleteCorso } from "@/lib/models/corsi";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const corso = await getCorsoById(Number(id));
    if (!corso) return NextResponse.json({ error: "Corso non trovato." }, { status: 404 });
    return NextResponse.json(corso);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Errore nel recupero del corso." }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nome, sottotitolo, descrizione, eta, colore } = body;

    if (!nome?.trim() || !sottotitolo?.trim() || !descrizione?.trim() || !eta?.trim()) {
      return NextResponse.json({ error: "Tutti i campi sono obbligatori." }, { status: 400 });
    }

    const updated = await updateCorso(Number(id), { nome, sottotitolo, descrizione, eta, colore });
    if (!updated) return NextResponse.json({ error: "Corso non trovato." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Errore nell'aggiornamento del corso." }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteCorso(Number(id));
    if (!deleted) return NextResponse.json({ error: "Corso non trovato." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Errore nell'eliminazione del corso." }, { status: 500 });
  }
}