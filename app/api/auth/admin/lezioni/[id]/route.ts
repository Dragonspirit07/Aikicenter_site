import { NextResponse } from "next/server";
import { getLezioneById, updateLezione, deleteLezione } from "@/lib/models/lezioni";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lezione = await getLezioneById(Number(id));
    if (!lezione) return NextResponse.json({ error: "Lezione non trovata." }, { status: 404 });
    return NextResponse.json(lezione);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Errore nel recupero della lezione." }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { giorno_settimana, orario_inizio, orario_fine, id_corso } = body;

    if (!giorno_settimana?.trim() || !orario_inizio?.trim() || !orario_fine?.trim()) {
      return NextResponse.json({ error: "Giorno e orari sono obbligatori." }, { status: 400 });
    }

    if (!id_corso || isNaN(Number(id_corso))) {
      return NextResponse.json({ error: "Seleziona un corso valido." }, { status: 400 });
    }

    const updated = await updateLezione(Number(id), {
      giorno_settimana: giorno_settimana.trim(),
      orario_inizio: orario_inizio.trim(),
      orario_fine: orario_fine.trim(),
      id_corso: Number(id_corso),
    });

    if (!updated) return NextResponse.json({ error: "Lezione non trovata." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Errore nell'aggiornamento della lezione.";
    return NextResponse.json({ error: msg }, { status: 409 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteLezione(Number(id));
    if (!deleted) return NextResponse.json({ error: "Lezione non trovata." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Errore nell'eliminazione della lezione." }, { status: 500 });
  }
}