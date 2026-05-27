"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import "./utente.css";

interface Lezione {
  id_lezione: number;
  giorno_settimana: string;
  orario_inizio: string;
  orario_fine: string;
  id_corso: number;
  nome_corso: string;
  colore: string;
  eta: string;
}

interface Profilo {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  data_nascita: string;
}

const GIORNI = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];

export default function UserDashboard() {
  const router = useRouter();
  const [profilo, setProfilo] = useState<Profilo | null>(null);
  const [lezioni, setLezioni] = useState<Lezione[]>([]);
  const [mieLezioni, setMieLezioni] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/auth/utente/iscrizioni");
        if (cancelled) return;

        if (!res.ok) {
          if (res.status === 401) router.push("/login");
          else setError("Errore nel caricamento dei dati.");
          return;
        }
        const data = await res.json();
        setProfilo(data.profilo);
        setMieLezioni(data.lezioniIscrizione);
        setLezioni(data.lezioni ?? []);
      } catch {
        if (!cancelled) setError("Errore di rete.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  async function toggleLezione(idLezione: number, iscritto: boolean) {
    const azione = iscritto ? "rimuovi" : "aggiungi";
    const res = await fetch("/api/auth/utente/iscrizioni", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_lezione: idLezione, azione }),
    });
    const data = await res.json();
    if (res.ok) {
      if (iscritto) {
        setMieLezioni((prev) => prev.filter((id) => id !== idLezione));
        showToast("Lezione rimossa", true);
      } else {
        setMieLezioni((prev) => [...prev, idLezione]);
        showToast("Iscrizione aggiunta", true);
      }
    } else {
      showToast(data.error ?? "Errore durante l'operazione.", false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  function raggruppaPerGiorno(lezioniList: Lezione[]) {
    return GIORNI.map((giorno) => ({
      giorno,
      lezioni: lezioniList.filter((l) => l.giorno_settimana === giorno),
    }));
  }

  if (loading) {
    return (
      <main className="utente-main">
        <div className="utente-loading">Caricamento in corso…</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="utente-main">
        <div className="utente-error">{error}</div>
      </main>
    );
  }

  return (
    <main className="utente-main">
      {toast && <div className={`utente-toast ${toast.ok ? "success" : "error"}`}>{toast.msg}</div>}

      <div className="utente-header">
        <h1>Area Utente</h1>
        <button className="logout-btn" onClick={handleLogout} type="button">Esci</button>
      </div>

      {profilo && (
        <div className="utente-profilo">
          <h2>I Tuoi Dati</h2>
          <div className="utente-profilo-grid">
            <div><strong>Nome:</strong> {profilo.nome} {profilo.cognome}</div>
            <div><strong>Email:</strong> {profilo.email}</div>
            <div><strong>Telefono:</strong> {profilo.telefono}</div>
            <div><strong>Data di nascita:</strong> {profilo.data_nascita?.split("T")[0]}</div>
          </div>
        </div>
      )}

      <div className="utente-lezioni">
        <h2>Iscrizione alle Lezioni</h2>
        <p className="utente-note">Seleziona o deseleziona le lezioni a cui desideri partecipare.</p>

        <div className="orari-grid">
          {raggruppaPerGiorno(lezioni).map((g) => (
            <div key={g.giorno} className={`giorno-card ${g.lezioni.length === 0 ? "giorno-card--vuoto" : ""}`}>
              <div className="giorno-header">
                <span className="giorno-nome">{g.giorno}</span>
              </div>
              <div className="giorno-body">
                {g.lezioni.length === 0 ? (
                  <div className="lezione-row lezione-riposo">
                    <span className="lezione-corso">Giorno di riposo</span>
                  </div>
                ) : (
                  g.lezioni.map((l) => {
                    const iscritto = mieLezioni.includes(l.id_lezione);
                    return (
                      <div key={l.id_lezione} className="lezione-row">
                        <div className="lezione-dot" style={{ background: l.colore ?? "#D32F2F" }} />
                        <div className="lezione-info">
                          <span className="lezione-corso">{l.nome_corso}</span>
                          <span className="lezione-meta">
                            <span className="lezione-orario">{l.orario_inizio} – {l.orario_fine}</span>
                            <span className="lezione-eta">{l.eta}</span>
                          </span>
                        </div>
                        <button
                          className={`lezione-toggle ${iscritto ? "iscritto" : ""}`}
                          onClick={() => toggleLezione(l.id_lezione, iscritto)}
                          type="button"
                        >
                          {iscritto ? "✓ Iscritto" : "+ Iscriviti"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </main>
  );
}
