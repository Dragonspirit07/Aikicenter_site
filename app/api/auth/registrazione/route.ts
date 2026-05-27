import { NextRequest, NextResponse } from "next/server";
import { createIscrizione, findByEmail } from "@/lib/models/iscrizioni";
import { hashPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  try {
    const { nome, cognome, email, password, telefono, data_nascita } = await req.json();

    if (!nome?.trim() || !cognome?.trim() || !email?.trim() || !password?.trim() || !telefono?.trim() || !data_nascita) {
      return NextResponse.json({ error: "Tutti i campi sono obbligatori." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La password deve essere di almeno 6 caratteri." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email non valida." }, { status: 400 });
    }

    if (!/^\d{10,15}$/.test(telefono.replace(/[\s\-\+]/g, ""))) {
      return NextResponse.json({ error: "Numero di telefono non valido." }, { status: 400 });
    }

    const existing = await findByEmail(email.trim().toLowerCase());
    if (existing) {
      return NextResponse.json({ error: "Email già registrata." }, { status: 409 });
    }

    const password_hash = await hashPassword(password);
    await createIscrizione({
      nome: nome.trim(),
      cognome: cognome.trim(),
      email: email.trim().toLowerCase(),
      password_hash,
      telefono: telefono.trim(),
      data_nascita,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Errore durante la registrazione." }, { status: 500 });
  }
}
