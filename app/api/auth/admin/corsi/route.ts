import { NextResponse } from "next/server";
import { getAllCorsi, createCorso } from "@/lib/models/corsi";

export async function GET() {
  try {
    const corsi = await getAllCorsi();
    return NextResponse.json(corsi);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Errore nel recupero dei corsi." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, sottotitolo, descrizione, eta, colore } = body;

    if (!nome?.trim() || !sottotitolo?.trim() || !descrizione?.trim() || !eta?.trim()) {
      return NextResponse.json({ error: "Tutti i campi sono obbligatori." }, { status: 400 });
    }

    await createCorso({ nome, sottotitolo, descrizione, eta, colore: colore || "#D32F2F" });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Errore nella creazione del corso." }, { status: 500 });
  }
}