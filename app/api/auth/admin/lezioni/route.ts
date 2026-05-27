import { NextResponse } from "next/server";
import { getAllLezioni, createLezione } from "@/lib/models/lezioni";

export async function GET() {
  try {
    const lezioni = await getAllLezioni();
    return NextResponse.json(lezioni);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Errore nel recupero delle lezioni." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { giorno_settimana, orario_inizio, orario_fine, id_corso } = body;

    if (!giorno_settimana?.trim() || !orario_inizio?.trim() || !orario_fine?.trim()) {
      return NextResponse.json({ error: "Giorno e orari sono obbligatori." }, { status: 400 });
    }

    if (!id_corso || isNaN(Number(id_corso))) {
      return NextResponse.json({ error: "Seleziona un corso valido." }, { status: 400 });
    }

    await createLezione({
      giorno_settimana: giorno_settimana.trim(),
      orario_inizio: orario_inizio.trim(),
      orario_fine: orario_fine.trim(),
      id_corso: Number(id_corso),
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Errore nella creazione della lezione.";
    return NextResponse.json({ error: msg }, { status: 409 });
  }
}