import type { Metadata } from "next";
import { getAllLezioni, LezioneConCorso } from "@/lib/models/lezioni";
import { getAllCorsi } from "@/lib/models/corsi";
import "./orari.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orari Lezioni",
  description:
    "Aiki Center ETS Parma: Orari delle lezioni e attività. Consulta i nostri orari per bambini, ragazzi e adulti.",
  keywords: ["Aikido", "Parma", "Orari Aikido", "Lezioni Aikido", "Corsi Aikido", "Aiki Center"],
};

const GIORNI = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];

function raggruppaPerGiorno(lezioni: LezioneConCorso[]) {
  return GIORNI.map((giorno) => ({
    giorno,
    lezioni: lezioni.filter((l) => l.giorno_settimana === giorno),
  }));
}

function GiornoCard({ giorno, lezioni }: { giorno: string; lezioni: LezioneConCorso[] }) {
  if (lezioni.length === 0) {
    return (
      <div className="giorno-card giorno-card--vuoto">
        <div className="giorno-header">
          <span className="giorno-nome">{giorno}</span>
        </div>
        <div className="giorno-body">
          <div className="lezione-row lezione-riposo">
            <span className="lezione-corso">Giorno di riposo</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="giorno-card">
      <div className="giorno-header">
        <span className="giorno-nome">{giorno}</span>
      </div>
      <div className="giorno-body">
        {lezioni.map((l) => (
          <div key={l.id_lezione} className="lezione-row">
            <div
              className="lezione-dot"
              style={{ background: l.colore ?? "#D32F2F" }}
            />
            <div className="lezione-info">
              <span className="lezione-corso">{l.nome_corso}</span>
              <span className="lezione-meta">
                <span className="lezione-orario">{l.orario_inizio} – {l.orario_fine}</span>
                <span className="lezione-eta">{l.eta}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function OrariPage() {
  const lezioni = await getAllLezioni();
  const corsi = await getAllCorsi();
  const orariPerGiorno = raggruppaPerGiorno(lezioni);

  return (
    <main>
      <h1>Orari delle Lezioni</h1>

      <h4>
        Qui trovi tutti gli orari aggiornati delle attività dell&apos;
        <b>AIKI CENTER ETS</b>. I corsi si svolgono presso la nostra sede in{" "}
        <b>Via San Leonardo 191a, Parma</b>. Per qualsiasi dubbio contattaci
        via{" "}
        <a href="https://wa.me/3483556535" style={{ color: "var(--titoli)" }}>
          WhatsApp
        </a>{" "}
        o telefono al{" "}
        <a href="tel:3483556535" style={{ color: "var(--titoli)" }}>
          348 355 6535
        </a>
        .
      </h4>

      <h4 className="alert red">
        <u><b>Inizio corsi: 18 Settembre 2026!</b></u>
      </h4>

      <div className="orari-grid">
        {orariPerGiorno.map((g) => (
          <GiornoCard key={g.giorno} giorno={g.giorno} lezioni={g.lezioni} />
        ))}
      </div>

      <div className="legenda">
        <h2>I Nostri Corsi</h2>
        <ul className="legenda-lista">
          {corsi.map((corso) => (
            <li
              key={corso.id}
              className="legenda-item"
              style={{ borderLeftColor: corso.colore ?? "#D32F2F" }}
            >
              <div className="legenda-content">
                <div className="legenda-header">
                  <div
                    className="legenda-dot"
                    style={{ background: corso.colore ?? "#D32F2F" }}
                  />
                  <strong className="legenda-nome">{corso.nome}</strong>
                  <span className="legenda-eta">{corso.eta}</span>
                </div>
                <p className="legenda-sottotitolo">{corso.sottotitolo}</p>
                <p className="legenda-descrizione">{corso.descrizione}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="nota-avviso">
        <p>
          <b>N.B.:</b> Per garantire alto livello di qualità e la sicurezza
          delle attività, i corsi sono{" "}
          <u><b>a numero chiuso</b></u>{" "}
          e riservati ai Deshi o ai Soci AIKI CENTER ETS. Data l&apos;alta
          richiesta si consiglia la{" "}
          <u><b>preiscrizione</b></u>{" "}
          (gratuita) per tempo in modo da riservare il posto o essere inseriti
          in lista d&apos;attesa.
        </p>
      </div>

      <p className="info">
        La sede è dotata di un ampio parcheggio.
        <br />
        Puoi trovarci presso{" "}
        <a href="https://maps.app.goo.gl/Ly7DBD3EJPYQCWtZ7" target="_blank" rel="noopener noreferrer">
          <b>Via San Leonardo 191a, 43122 Parma</b>
        </a>{" "}
        — telefono{" "}
        <a href="tel:1234567890">123 456 7890</a>
      </p>

      <a href="/iscrizione" target="_blank" rel="noopener noreferrer">
        <button className="btn" type="button">Preiscriviti Ora</button>
      </a>
    </main>
  );
}