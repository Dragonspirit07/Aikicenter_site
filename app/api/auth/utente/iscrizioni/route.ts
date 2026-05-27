import { NextRequest, NextResponse } from "next/server";
import { verifyUserToken, USER_COOKIE_NAME } from "@/lib/jwt-utente";
import { getIscrizioneById, getLezioniIscrizione, addLezioneIscrizione, removeLezioneIscrizione } from "@/lib/models/iscrizioni";
import { getAllLezioni } from "@/lib/models/lezioni";

async function getUser(req: NextRequest) {
  const token = req.cookies.get(USER_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await verifyUserToken(token);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  try {
    const [profilo, lezioniIscrizione, lezioni] = await Promise.all([
      getIscrizioneById(user.id),
      getLezioniIscrizione(user.id),
      getAllLezioni(),
    ]);
    return NextResponse.json({ profilo, lezioniIscrizione, lezioni });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Errore nel recupero dei dati." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });

  try {
    const { id_lezione, azione } = await req.json();

    if (!id_lezione || isNaN(Number(id_lezione))) {
      return NextResponse.json({ error: "ID lezione non valido." }, { status: 400 });
    }

    const idLezione = Number(id_lezione);

    if (azione === "aggiungi") {
      await addLezioneIscrizione(user.id, idLezione);
    } else if (azione === "rimuovi") {
      await removeLezioneIscrizione(user.id, idLezione);
    } else {
      return NextResponse.json({ error: "Azione non valida." }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Errore durante l'operazione." }, { status: 500 });
  }
}
