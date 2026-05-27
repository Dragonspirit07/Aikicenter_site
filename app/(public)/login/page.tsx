"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"accedi" | "registrazione">("accedi");

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [regForm, setRegForm] = useState({
    nome: "", cognome: "", email: "", password: "", telefono: "", data_nascita: "",
  });
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginForm.username, password: loginForm.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error ?? "Errore durante il login.");
      } else {
        router.push(data.redirect ?? "/");
      }
    } catch {
      setLoginError("Errore di rete. Riprova più tardi.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRegError("");
    setRegSuccess(false);
    setRegLoading(true);
    try {
      const res = await fetch("/api/auth/registrazione", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setRegError(data.error ?? "Errore durante la registrazione.");
      } else {
        setRegSuccess(true);
        setRegForm({ nome: "", cognome: "", email: "", password: "", telefono: "", data_nascita: "" });
      }
    } catch {
      setRegError("Errore di rete. Riprova più tardi.");
    } finally {
      setRegLoading(false);
    }
  }

  return (
    <main className="login-main">
      <div className="login-card">
        <div className="login-header">
          <h1>Area Riservata</h1>
          <p><strong>AIKI CENTER ETS</strong></p>
        </div>

        <div className="login-tabs">
          <button className={`login-tab ${tab === "accedi" ? "active" : ""}`} onClick={() => setTab("accedi")} type="button">Accedi</button>
          <button className={`login-tab ${tab === "registrazione" ? "active" : ""}`} onClick={() => setTab("registrazione")} type="button">Registrati</button>
        </div>

        {tab === "accedi" && (
          <form className="login-form" onSubmit={handleLoginSubmit} noValidate>
            <div className="login-field">
              <label htmlFor="login-id">Email</label>
              <input
                id="login-id"
                type="text"
                autoComplete="username"
                required
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                disabled={loginLoading}
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                disabled={loginLoading}
              />
            </div>

            {loginError && (
              <div className="login-error" role="alert">
                <i className="fa fa-exclamation-circle" aria-hidden="true" />{loginError}
              </div>
            )}

            <button className="btn login-btn" type="submit" disabled={loginLoading}>
              {loginLoading ? "Accesso in corso…" : "Accedi"}
            </button>
          </form>
        )}

        {tab === "registrazione" && (
          <form className="login-form" onSubmit={handleRegSubmit} noValidate>
            {regSuccess && (
              <div className="login-success" role="alert">
                <i className="fa fa-check-circle" aria-hidden="true" />Registrazione completata! Ora puoi accedere.
              </div>
            )}

            <div className="login-field-row">
              <div className="login-field">
                <label htmlFor="reg-nome">Nome</label>
                <input id="reg-nome" type="text" required value={regForm.nome}
                  onChange={(e) => setRegForm({ ...regForm, nome: e.target.value })} disabled={regLoading} />
              </div>
              <div className="login-field">
                <label htmlFor="reg-cognome">Cognome</label>
                <input id="reg-cognome" type="text" required value={regForm.cognome}
                  onChange={(e) => setRegForm({ ...regForm, cognome: e.target.value })} disabled={regLoading} />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="reg-email">Email</label>
              <input id="reg-email" type="email" autoComplete="email" required value={regForm.email}
                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} disabled={regLoading} />
            </div>

            <div className="login-field-row">
              <div className="login-field">
                <label htmlFor="reg-telefono">Telefono</label>
                <input id="reg-telefono" type="tel" required value={regForm.telefono}
                  onChange={(e) => setRegForm({ ...regForm, telefono: e.target.value })} disabled={regLoading} />
              </div>
              <div className="login-field">
                <label htmlFor="reg-data">Data di nascita</label>
                <input id="reg-data" type="date" required value={regForm.data_nascita}
                  onChange={(e) => setRegForm({ ...regForm, data_nascita: e.target.value })} disabled={regLoading} />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="reg-password">Password</label>
              <input id="reg-password" type="password" autoComplete="new-password" required minLength={6} value={regForm.password}
                onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} disabled={regLoading} />
            </div>

            {regError && (
              <div className="login-error" role="alert">
                <i className="fa fa-exclamation-circle" aria-hidden="true" />{regError}
              </div>
            )}

            <button className="btn login-btn" type="submit" disabled={regLoading}>
              {regLoading ? "Registrazione in corso…" : "Registrati"}
            </button>
          </form>
        )}

      </div>
    </main>
  );
}
