import { NextResponse } from "next/server";
import { getAllIscrizioniConLezioni } from "@/lib/models/iscrizioni";

export async function GET() {
  try {
    const data = await getAllIscrizioniConLezioni();
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Errore nel recupero degli utenti." }, { status: 500 });
  }
}
