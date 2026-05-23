# 🗳️ Elezioni Comunali — San Cipriano d'Aversa

App web mobile-first per il conteggio voti in tempo reale durante le elezioni comunali.
Supporta più dispositivi simultanei, aggiornamento live, massimo 30 candidati, e export dei risultati.

---

## Stack tecnologico

| Tecnologia | Scopo |
|-----------|-------|
| React + Vite + TypeScript | Frontend |
| Supabase | Database PostgreSQL + Realtime WebSocket |
| Recharts | Grafico a torta |
| jsPDF + jspdf-autotable | Export PDF |
| html2canvas | Export grafico PNG |
| lucide-react | Icone |

---

## Setup Supabase (5 minuti)

### 1. Crea il progetto Supabase

1. Vai su [https://supabase.com](https://supabase.com) e accedi
2. Clicca **New project**
3. Scegli un nome (es. `elezioni-san-cipriano`) e una password per il DB
4. Seleziona la regione **EU West** (Frankfurt o Paris)
5. Attendi che il progetto si avvii (~1 minuto)

### 2. Esegui lo schema SQL

1. Nel pannello Supabase, clicca **SQL Editor** nel menu a sinistra
2. Clicca **New query**
3. Incolla il contenuto del file `supabase-schema.sql` (nella root del progetto)
4. Clicca **Run**
5. Dovresti vedere: `Success. No rows returned`

### 3. Verifica il Realtime

1. Vai su **Database → Replication**
2. Assicurati che la tabella `candidates` sia nella lista con Realtime abilitato
3. Se non è presente, esegui in SQL Editor:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE candidates;
   ```

### 4. Recupera le credenziali

1. Vai su **Settings → API**
2. Copia:
   - **Project URL** (es. `https://abcdefgh.supabase.co`)
   - **anon / public key** (lunga stringa JWT)

### 5. Crea il file `.env`

Nella root del progetto crea un file `.env`:

```env
VITE_SUPABASE_URL=https://tuoprogetto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Avvio in sviluppo

```bash
npm install   # solo la prima volta
npm run dev
```

L'app sarà disponibile su `http://localhost:5173`.
Aprila su più dispositivi nella stessa rete per testare il Realtime.

---

## Build produzione

```bash
npm run build
npm run preview   # test build locale
```

La cartella `dist/` può essere deployata su Vercel, Netlify, GitHub Pages o qualsiasi hosting statico.

### Deploy rapido su Vercel (gratis)

```bash
npx vercel
```

Imposta le variabili d'ambiente nel pannello Vercel → Settings → Environment Variables.

---

## Struttura del progetto

```
APP ELEZIONI/
├── src/
│   ├── components/
│   │   ├── AddCandidateForm.tsx   # Form aggiunta candidati
│   │   ├── CandidateCard.tsx      # Card votazione (+/-)
│   │   ├── ResultsView.tsx        # Grafico + tabella + export
│   │   └── StatusBadge.tsx        # Indicatore connessione Live
│   ├── hooks/
│   │   └── useCandidates.ts       # Stato globale + Supabase Realtime
│   ├── lib/
│   │   ├── supabase.ts            # Client Supabase + tipi
│   │   ├── api.ts                 # Operazioni DB (CRUD + voti)
│   │   └── export.ts              # CSV, PDF, PNG
│   ├── App.tsx                    # Layout + navigazione tab
│   ├── main.tsx                   # Entrypoint React
│   └── index.css                  # Design system completo
├── supabase-schema.sql            # Schema DB + RLS + Realtime
├── .env.example                   # Template variabili ambiente
└── README.md
```

---

## Funzionalità

### Conteggio voti
- Aggiungi fino a **30 candidati** con nome personalizzato
- Nomi duplicati **non consentiti**
- Pulsanti **+** (verde) e **-** (rosso) grandi e touch-friendly
- I voti **non scendono mai sotto 0**
- **Aggiornamento ottimistico**: il contatore si aggiorna istantaneamente
- **Tutti i dispositivi** vedono i voti aggiornati in tempo reale via WebSocket

### Risultati
- Totale voti sempre visibile
- Classifica automatica dal più votato al meno
- Percentuale calcolata in tempo reale
- Grafico a torta interattivo

### Export
| Formato | Contenuto |
|---------|-----------|
| **CSV** | Posizione, nome, voti, percentuale |
| **PDF** | Intestazione, data, totale, tabella formattata |
| **PNG** | Screenshot del grafico a torta |

---

## Accesso

L'app è **completamente aperta**, senza login, password o protezioni.
Le Row Level Security di Supabase permettono lettura e scrittura anonima.

---

## Note tecniche

- **Realtime**: usa `postgres_changes` di Supabase (WebSocket, nessun polling)
- **Aggiornamenti ottimistici**: il voto appare immediatamente con rollback automatico in caso di errore
- **Limite 30 candidati**: verificato lato UI e API
- **Reset voti**: con doppia conferma per evitare click accidentali
