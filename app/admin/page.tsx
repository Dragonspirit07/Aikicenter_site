"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import "./admin.css";
import Link from 'next/link';
import { Navbar } from "@/ui/navbar";


// ── Tipi ─────────────────────────────────────────────────────────────
interface Corso {
  id: number;
  nome: string;
  sottotitolo: string;
  descrizione: string;
  eta: string;
  colore: string;
}

interface Lezione {
  id_lezione: number;
  giorno_settimana: string;
  orario_inizio: string;
  orario_fine: string;
  id_corso: number;
  nome_corso?: string;
  eta?: string;
}

interface IscrizioneRow {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  data_nascita: string;
  id_lezione: number | null;
  giorno_settimana: string | null;
  orario_inizio: string | null;
  orario_fine: string | null;
  nome_corso: string | null;
  colore: string | null;
}

const GIORNI = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];

const emptyCorso = (): Omit<Corso, "id"> => ({
  nome: "", sottotitolo: "", descrizione: "", eta: "", colore: "#D32F2F",
});

const emptyLezione = (): Omit<Lezione, "id_lezione" | "nome_corso" | "eta"> => ({
  giorno_settimana: "Lunedì", orario_inizio: "", orario_fine: "", id_corso: 0,
});

// ── Componente modale ────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Chiudi">×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ── Form Corso ────────────────────────────────────────────────────────
function CorsoForm({
  initial, onSave, onCancel, saving,
}: {
  initial: Omit<Corso, "id"> & { id?: number };
  onSave: (data: Omit<Corso, "id">) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  return (
    <form className="admin-form" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <div className="field-group">
        <label>Nome corso *</label>
        <input required value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="es. Aikidō Adulti" />
      </div>
      <div className="field-group">
        <label>Sottotitolo *</label>
        <input required value={form.sottotitolo} onChange={(e) => set("sottotitolo", e.target.value)} placeholder="Breve descrizione" />
      </div>
      <div className="field-group">
        <label>Descrizione *</label>
        <textarea required rows={3} value={form.descrizione} onChange={(e) => set("descrizione", e.target.value)} placeholder="Descrizione completa del corso" />
      </div>
      <div className="field-group">
        <label>Fascia età *</label>
        <input required value={form.eta} onChange={(e) => set("eta", e.target.value)} placeholder="es. 14+ anni" />
      </div>
      <div className="field-group">
        <label>Colore corso</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <input
              type="color"
              value={form.colore || "#D32F2F"}
              onChange={(e) => set("colore", e.target.value)}
              style={{ width: 36, height: 36, padding: 2, border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer" }}
              title="Scegli colore personalizzato"
            />
            <input
              value={form.colore || "#D32F2F"}
              onChange={(e) => set("colore", e.target.value)}
              placeholder="#D32F2F"
              pattern="^#[0-9A-Fa-f]{6}$"
              maxLength={7}
              style={{ fontFamily: "monospace", width: 100, padding: "0.4rem 0.6rem", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.88rem" }}
            />  
          </div>
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>Annulla</button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Salvataggio…" : "Salva"}
        </button>
      </div>
    </form>
  );
}

// ── Form Lezione ──────────────────────────────────────────────────────
function LezioneForm({
  initial, corsi, onSave, onCancel, saving,
}: {
  initial: Omit<Lezione, "id_lezione" | "nome_corso" | "eta"> & { id_lezione?: number };
  corsi: Corso[];
  onSave: (data: Omit<Lezione, "id_lezione" | "nome_corso" | "eta">) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({ ...initial, id_corso: initial.id_corso || (corsi[0]?.id ?? 0) });
  function set(k: string, v: string | number) { setForm((f) => ({ ...f, [k]: v })); }

  return (
    <form className="admin-form" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <div className="field-row">
        <div className="field-group">
          <label>Giorno *</label>
          <select required value={form.giorno_settimana} onChange={(e) => set("giorno_settimana", e.target.value)}>
            {GIORNI.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="field-group">
          <label>Inizio *</label>
          <input required type="time" value={form.orario_inizio} onChange={(e) => set("orario_inizio", e.target.value)} />
        </div>
        <div className="field-group">
          <label>Fine *</label>
          <input required type="time" value={form.orario_fine} onChange={(e) => set("orario_fine", e.target.value)} />
        </div>
      </div>
      <div className="field-group">
        <label>Corso *</label>
        <select required value={form.id_corso} onChange={(e) => set("id_corso", Number(e.target.value))}>
          {corsi.map((c) => <option key={c.id} value={c.id}>{c.nome} ({c.eta})</option>)}
        </select>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>Annulla</button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Salvataggio…" : "Salva"}
        </button>
      </div>
    </form>
  );
}

// ── Finestra di conferma eliminazione ─────────────────────────────────
function ConfirmDelete({ label, onConfirm, onCancel }: { label: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal title="Conferma eliminazione" onClose={onCancel}>
      <p className="confirm-text">Sei sicuro di voler eliminare <strong>{label}</strong>? L&apos;operazione è irreversibile.</p>
      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>Annulla</button>
        <button className="btn-danger" onClick={onConfirm}>Elimina</button>
      </div>
    </Modal>
  );
}

// ── Componente principale ─────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();

  // Dati
  const [corsi, setCorsi] = useState<Corso[]>([]);
  const [lezioni, setLezioni] = useState<Lezione[]>([]);
  const [utenti, setUtenti] = useState<IscrizioneRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  // Navigazione
  const [tab, setTab] = useState<"corsi" | "lezioni" | "utenti">("corsi");

  // Modali
  const [corsoModal, setCorsoModal] = useState<null | "new" | Corso>(null);
  const [lezioneModal, setLezioneModal] = useState<null | "new" | Lezione>(null);
  const [deleteTarget, setDeleteTarget] = useState<null | { type: "corso" | "lezione" | "utente"; id: number; label: string }>(null);
  const [saving, setSaving] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rc, rl, ru] = await Promise.all([
        fetch("/api/auth/admin/corsi"),
        fetch("/api/auth/admin/lezioni"),
        fetch("/api/auth/admin/iscrizioni"),
      ]);
      if (rc.status === 401 || rl.status === 401) { router.push("/login"); return; }
      setCorsi(await rc.json());
      setLezioni(await rl.json());
      setUtenti(await ru.json());
    } catch {
      showToast("Errore durante il caricamento dei dati.", "err");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function showToast(msg: string, type: "ok" | "err") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Logout ───────────────────────────────────────────────────────
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login?loggedOut=1");
  }

  // ── CRUD Corsi ───────────────────────────────────────────────────
  async function saveCorso(data: Omit<Corso, "id">) {
    setSaving(true);
    const isEdit = corsoModal !== "new" && corsoModal !== null;
    const id = isEdit ? (corsoModal as Corso).id : undefined;
    try {
      const res = await fetch(isEdit ? `/api/auth/admin/corsi/${id}` : "/api/auth/admin/corsi", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      showToast(isEdit ? "Corso aggiornato!" : "Corso creato!", "ok");
      setCorsoModal(null);
      fetchAll();
    } catch (e) {
      showToast((e as Error).message, "err");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCorso(id: number) {
    setSaving(true);
    try {
      const res = await fetch(`/api/auth/admin/corsi/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      showToast("Corso eliminato.", "ok");
      setDeleteTarget(null);
      fetchAll();
    } catch (e) {
      showToast((e as Error).message, "err");
    } finally {
      setSaving(false);
    }
  }

  // ── CRUD Lezioni ─────────────────────────────────────────────────
  async function saveLezione(data: Omit<Lezione, "id_lezione" | "nome_corso" | "eta">) {
    setSaving(true);
    const isEdit = lezioneModal !== "new" && lezioneModal !== null;
    const id = isEdit ? (lezioneModal as Lezione).id_lezione : undefined;
    try {
      const res = await fetch(isEdit ? `/api/auth/admin/lezioni/${id}` : "/api/auth/admin/lezioni", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      showToast(isEdit ? "Lezione aggiornata!" : "Lezione creata!", "ok");
      setLezioneModal(null);
      fetchAll();
    } catch (e) {
      showToast((e as Error).message, "err");
    } finally {
      setSaving(false);
    }
  }

  async function deleteLezione(id: number) {
    setSaving(true);
    try {
      const res = await fetch(`/api/auth/admin/lezioni/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      showToast("Lezione eliminata.", "ok");
      setDeleteTarget(null);
      fetchAll();
    } catch (e) {
      showToast((e as Error).message, "err");
    } finally {
      setSaving(false);
    }
  }

  // ── CRUD Utenti ──────────────────────────────────────────────────
  async function deleteUtente(id: number) {
    setSaving(true);
    try {
      const res = await fetch(`/api/auth/admin/iscrizioni/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      showToast("Utente eliminato.", "ok");
      setDeleteTarget(null);
      fetchAll();
    } catch (e) {
      showToast((e as Error).message, "err");
    } finally {
      setSaving(false);
    }
  }

  // ── Raggruppa utenti con lezioni ──────────────────────────────────
  function raggruppaUtenti(rows: IscrizioneRow[]) {
    const map = new Map<number, { id: number; nome: string; cognome: string; email: string; telefono: string; data_nascita: string; lezioni: { id_lezione: number; giorno_settimana: string; orario_inizio: string; orario_fine: string; nome_corso: string; colore: string }[] }>();
    for (const r of rows) {
      if (!map.has(r.id)) {
        map.set(r.id, { id: r.id, nome: r.nome, cognome: r.cognome, email: r.email, telefono: r.telefono, data_nascita: r.data_nascita, lezioni: [] });
      }
      if (r.id_lezione) {
        map.get(r.id)!.lezioni.push({
          id_lezione: r.id_lezione,
          giorno_settimana: r.giorno_settimana!,
          orario_inizio: r.orario_inizio!,
          orario_fine: r.orario_fine!,
          nome_corso: r.nome_corso!,
          colore: r.colore!,
        });
      }
    }
    return Array.from(map.values());
  }

  // ── Raggruppa lezioni per giorno ──────────────────────────────────
  const lezioniPerGiorno = GIORNI.map((g) => ({
    giorno: g,
    lezioni: lezioni.filter((l) => l.giorno_settimana === g),
  })).filter((g) => g.lezioni.length > 0);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="admin-root">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="sidebar-logo">
            <span className="logo-mark">AC</span>
            <span className="logo-text">Admin</span>
          </div>

          <div className="sidebar-nav">
            <button
              className={`nav-item ${tab === "corsi" ? "active" : ""}`}
              onClick={() => setTab("corsi")}
            >
              <span className="nav-icon">📚</span>
              <span>Corsi</span>
              <span className="nav-badge">{corsi.length}</span>
            </button>
            <button
              className={`nav-item ${tab === "lezioni" ? "active" : ""}`}
              onClick={() => setTab("lezioni")}
            >
              <span className="nav-icon">📅</span>
              <span>Lezioni</span>
              <span className="nav-badge">{lezioni.length}</span>
            </button>
            <button
              className={`nav-item ${tab === "utenti" ? "active" : ""}`}
              onClick={() => setTab("utenti")}
            >
              <span className="nav-icon">👥</span>
              <span>Utenti</span>
              <span className="nav-badge">{new Set(utenti.map((u) => u.id)).size}</span>
            </button>
          </div>

          <div className="sidebar-footer">
            <Link href="/" className="sidebar-link" title="Vai al sito">
              <span className="footer-icon">🏠</span>
              <span className="footer-text">Vai al sito</span>
            </Link>
            <button className="logout-btn" onClick={handleLogout} title="Esci">
              <span className="footer-icon">🚪</span>
              <span className="footer-text">Esci</span>
            </button>
          </div>
        </aside>

        {/* Contenuto principale */}
        <main className="admin-content">
          {/* Header */}
          <header className="content-header">
            <div>
              <h1>{tab === "corsi" ? "Corsi" : tab === "lezioni" ? "Lezioni" : "Utenti"}</h1>
              <p className="header-sub">
                {tab === "corsi"
                  ? "Gestisci i corsi offerti dall'AIKI CENTER ETS"
                  : tab === "lezioni"
                  ? "Gestisci gli orari delle lezioni settimanali"
                  : "Visualizza gli utenti iscritti e le loro lezioni"}
              </p>
            </div>
            {tab !== "utenti" && (
              <button
                className="btn-add"
                onClick={() => tab === "corsi" ? setCorsoModal("new") : setLezioneModal("new")}
              >
                + Aggiungi {tab === "corsi" ? "corso" : "lezione"}
              </button>
            )}
          </header>

        {/* Loading */}
        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <span>Caricamento…</span>
          </div>
        )}

        {/* ── TAB CORSI ── */}
        {!loading && tab === "corsi" && (
          <div className="cards-grid">
            {corsi.length === 0 && (
              <div className="empty-state">
                <p>Nessun corso trovato.</p>
              </div>
            )}
            {corsi.map((corso) => (
              <div key={corso.id} className="data-card">
                <div className="card-top">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{
                      display: "inline-block",
                      width: 12, height: 12,
                      borderRadius: "50%",
                      background: corso.colore || "#D32F2F",
                      flexShrink: 0,
                      border: "1px solid rgba(0,0,0,0.1)",
                    }} />
                    <div className="card-badge">{corso.eta}</div>
                  </div>
                  <div className="card-actions">
                    <button className="icon-btn edit" title="Modifica" onClick={() => setCorsoModal(corso)}>✏️</button>
                    <button className="icon-btn delete" title="Elimina" onClick={() => setDeleteTarget({ type: "corso", id: corso.id, label: corso.nome })}>🗑️</button>
                  </div>
                </div>
                <h3 className="card-title">{corso.nome}</h3>
                <p className="card-subtitle">{corso.sottotitolo}</p>
                <p className="card-desc">{corso.descrizione}</p>
                <div className="card-footer">
                  <span className="lezioni-count">
                    {lezioni.filter((l) => l.id_corso === corso.id).length} lezioni
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB LEZIONI ── */}
        {!loading && tab === "lezioni" && (
          <div className="lezioni-container">
            {lezioniPerGiorno.length === 0 && (
              <div className="empty-state">
                <p>Nessuna lezione trovata.</p>
              </div>
            )}
            {lezioniPerGiorno.map(({ giorno, lezioni: lz }) => (
              <section key={giorno}>
                <h2 className="giorno-title">
                  <span className="giorno-dot" />
                  {giorno}
                  <span className="giorno-count">{lz.length}</span>
                </h2>
                <div className="lezioni-table">
                  <div className="table-header">
                    <span>Orario</span>
                    <span>Corso</span>
                    <span className="th-eta">Fascia età</span>
                    <span className="th-actions">Azioni</span>
                  </div>
                  {lz.map((l) => (
                    <div key={l.id_lezione} className="table-row">
                      <span className="orario-pill">{l.orario_inizio} – {l.orario_fine}</span>
                      <span className="corso-nome">{l.nome_corso}</span>
                      <span className="corso-eta">{l.eta}</span>
                      <span className="row-actions">
                        <button
                          className="icon-btn edit"
                          title="Modifica"
                          onClick={() => setLezioneModal(l)}
                        >✏️</button>
                        <button
                          className="icon-btn delete"
                          title="Elimina"
                          onClick={() => setDeleteTarget({ type: "lezione", id: l.id_lezione, label: `${l.nome_corso} – ${giorno} ${l.orario_inizio}` })}
                        >🗑️</button>
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* ── TAB UTENTI ── */}
        {!loading && tab === "utenti" && (
          <div className="utenti-container">
            {utenti.length === 0 && (
              <div className="empty-state">
                <p>Nessun utente registrato.</p>
              </div>
            )}
            {raggruppaUtenti(utenti).map((utente) => (
              <section key={utente.id} className="utente-section">
                <div className="utente-intestazione">
                  <div className="utente-info">
                    <strong>{utente.nome} {utente.cognome}</strong>
                    <span className="utente-email">{utente.email}</span>
                    <span className="utente-tel">{utente.telefono}</span>
                    <span className="utente-data">Nato: {utente.data_nascita?.split("T")[0]}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                    <span className="utente-count">
                      {utente.lezioni.length === 0
                        ? "Nessuna lezione"
                        : `${utente.lezioni.length} ${utente.lezioni.length === 1 ? "lezione" : "lezioni"}`}
                    </span>
                    <button
                      className="icon-btn delete"
                      title="Elimina utente"
                      onClick={() => setDeleteTarget({
                        type: "utente",
                        id: utente.id,
                        label: `${utente.nome} ${utente.cognome} (${utente.email})`,
                      })}
                    >🗑️</button>
                  </div>
                </div>
                {utente.lezioni.length > 0 && (
                  <div className="lezioni-table">
                    <div className="table-header">
                      <span>Giorno</span>
                      <span>Orario</span>
                      <span>Corso</span>
                    </div>
                    {utente.lezioni.map((l, i) => (
                      <div key={`${utente.id}-${l.id_lezione ?? i}`} className="table-row">
                        <span>{l.giorno_settimana}</span>
                        <span className="orario-pill">{l.orario_inizio} – {l.orario_fine}</span>
                        <span className="corso-nome" style={{ borderLeftColor: l.colore ?? "#D32F2F" }}>
                          {l.nome_corso}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </main>

      {/* ── MODALI ── */}
      {corsoModal && (
        <Modal
          title={corsoModal === "new" ? "Nuovo corso" : `Modifica: ${(corsoModal as Corso).nome}`}
          onClose={() => setCorsoModal(null)}
        >
          <CorsoForm
            initial={corsoModal === "new" ? emptyCorso() : (corsoModal as Corso)}
            onSave={saveCorso}
            onCancel={() => setCorsoModal(null)}
            saving={saving}
          />
        </Modal>
      )}

      {lezioneModal && (
        <Modal
          title={lezioneModal === "new" ? "Nuova lezione" : "Modifica lezione"}
          onClose={() => setLezioneModal(null)}
        >
          <LezioneForm
            initial={lezioneModal === "new" ? emptyLezione() : (lezioneModal as Lezione)}
            corsi={corsi}
            onSave={saveLezione}
            onCancel={() => setLezioneModal(null)}
            saving={saving}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDelete
          label={deleteTarget.label}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (deleteTarget.type === "corso") deleteCorso(deleteTarget.id);
            else if (deleteTarget.type === "lezione") deleteLezione(deleteTarget.id);
            else deleteUtente(deleteTarget.id);
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "ok" ? "✅" : "❌"} {toast.msg}
        </div>
      )}
    </div>
    </>
  );
}