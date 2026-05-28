# Aiki Center ETS — Sito Web

Sito web ufficiale dell'**Aiki Center ETS** di Parma, sviluppato con Next.js 16. Permette la visualizzazione degli orari delle lezioni, la registrazione e il login degli utenti, la preiscrizione ai corsi e la gestione completa tramite pannello amministrativo.

---

## Funzionalità

### Pubblico
- Visualizzazione degli orari settimanali con legenda dei corsi
- Pagina login e registrazione utenti

### Area Utente
- Dashboard personale con dati profilo
- Iscrizione e disiscrizione alle lezioni settimanali

### Area Amministrativa
- Gestione completa dei **corsi** (CRUD)
- Gestione completa delle **lezioni** (CRUD) con controllo conflitti orari
- Visualizzazione degli **utenti iscritti** e delle loro lezioni

---

## Stack Tecnologico

| Layer | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguaggio | TypeScript 5 |
| Stile | CSS Modules + Tailwind CSS 4 |
| Database | MySQL (mysql2) |
| Autenticazione | JWT custom (HMAC-SHA256 via Web Crypto API) |
| Hash password | PBKDF2 + SHA-256 via Web Crypto API |
| Package manager | pnpm |

---

## Struttura del Progetto

```
├── app/
│   ├── (public)/              # Layout pubblico (Navbar + Footer)
│   │   ├── layout.tsx         # Layout con Navbar e Footer
│   │   ├── page.tsx           # Homepage — orari lezioni
│   │   ├── orari.css          # Stili pagina orari
│   │   ├── login/             # Login e registrazione
│   │   │   ├── page.tsx
│   │   │   └── login.css
│   │   └── utente/            # Dashboard utente
│   │       ├── page.tsx
│   │       └── utente.css
│   ├── admin/                 # Pannello amministrativo
│   │   ├── page.tsx
│   │   └── admin.css
│   ├── api/
│   │   └── auth/
│   │       ├── login/             # POST login (admin + utente)
│   │       ├── logout/            # POST logout
│   │       ├── registrazione/     # POST registrazione utente
│   │       ├── admin/
│   │       │   ├── corsi/         # CRUD corsi
│   │       │   │   ├── [id]/route.ts
│   │       │   │   └── route.ts
│   │       │   ├── lezioni/       # CRUD lezioni (con ctrl conflitti)
│   │       │   │   ├── [id]/route.ts
│   │       │   │   └── route.ts
│   │       │   └── iscrizioni/    # GET/DELETE utenti
│   │       │       ├── [id]/route.ts
│   │       │       └── route.ts
│   │       └── utente/
│   │           └── iscrizioni/    # GET/POST/DELETE (profilo, lezioni, auto-eliminazione)
│   │               └── route.ts
│   ├── lib/
│   │   ├── db.ts              # Pool MySQL singleton
│   │   ├── jtw.ts             # JWT admin (sign/verify)
│   │   ├── jwt-utente.ts      # JWT utente (sign/verify)
│   │   ├── password.ts        # Hash e verifica PBKDF2
│   │   └── models/            # Query DB (admin, corsi, lezioni, iscrizioni)
│   └── ui/                    # Componenti condivisi (Navbar, Footer)
├── proxy.ts                    # Middleware Next.js — protezione route JWT
├── scripts/
│   └── generate-hash.mjs      # Utility per generare hash admin
```

---

## Installazione

### Prerequisiti

- Node.js ≥ 20.9
- pnpm
- MySQL / MariaDB

### 1. Clona il repository

```bash
git clone <url-repository>
cd progetto_informatica
```

### 2. Installa le dipendenze

```bash
pnpm install
```

### 3. Configura le variabili d'ambiente

Copia il file di esempio e compila i valori:

```bash
cp .env.example .env.local
```

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=la_tua_password
DB_NAME=aikicenter

JWT_SECRET=stringa-casuale-di-almeno-32-caratteri!
```

### 4. Crea il database

Crea un database MySQL e configura le seguenti tabelle:

- `admins` — account amministratori
- `corsi` — corsi offerti (nome, descrizione, età, colore)
- `lezioni` — lezioni settimanali (giorno, orario, corso)
- `iscrizioni` — utenti registrati
- `iscrizioni_lezioni` — tabella ponte utenti ↔ lezioni

```bash
mysql -u root -p aikicenter < aikicenter.sql
```

### 5. Crea l'account admin

Genera l'hash della password con lo script incluso:

```bash
# Modifica USERNAME e PASSWORD in scripts/generate-hash.mjs
node scripts/generate-hash.mjs
```

Copia ed esegui la query `INSERT` mostrata nel terminale.

### 6. Avvia il server di sviluppo

```bash
pnpm dev
```

L'app sarà disponibile su [http://localhost:3000](http://localhost:3000).

---

## Autenticazione

Il sistema gestisce **due tipi di utente** con cookie JWT separati:

| Cookie | Percorso protetto | Ruolo |
|---|---|---|
| `aiki_admin_token` | `/admin`, `/api/auth/admin/*` | Amministratore |
| `aiki_user_token` | `/utente`, `/api/auth/utente/*` | Utente registrato |

I token hanno durata di **8 ore** e vengono verificati dal middleware `proxy.ts` ad ogni richiesta sulle route protette.

Le password sono hashate con **PBKDF2 + SHA-256** (200.000 iterazioni, salt casuale a 16 byte) usando esclusivamente la Web Crypto API nativa — nessuna libreria esterna.

---

## Schema Database

```
admins              — account amministratori
corsi               — corsi offerti (nome, descrizione, età, colore)
lezioni             — lezioni settimanali (giorno, orario, corso)
iscrizioni          — utenti registrati
iscrizioni_lezioni  — tabella ponte utenti ↔ lezioni
```

---

## Script

| Comando | Descrizione |
|---|---|
| `pnpm dev` | Avvia il server di sviluppo |
| `pnpm build` | Build di produzione |
| `pnpm start` | Avvia il server di produzione |
| `pnpm lint` | Esegue ESLint |
| `node scripts/generate-hash.mjs` | Genera hash PBKDF2 per un nuovo admin |