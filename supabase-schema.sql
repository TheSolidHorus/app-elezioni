-- =============================================================
-- SCHEMA: Conteggio voti elezioni comunali San Cipriano d'Aversa
-- Versione 2 — Multi-sezione, 17 candidati fissi
-- =============================================================

-- Rimuovi tabelle vecchie se presenti
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS section_totals CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS sections CASCADE;

-- =============================================================
-- TABELLA: sections (13 sezioni fisse)
-- =============================================================
CREATE TABLE sections (
  id    integer PRIMARY KEY,
  name  text    NOT NULL
);

INSERT INTO sections (id, name) VALUES
  (1,  'Sezione 1'),
  (2,  'Sezione 2'),
  (3,  'Sezione 3'),
  (4,  'Sezione 4'),
  (5,  'Sezione 5'),
  (6,  'Sezione 6'),
  (7,  'Sezione 7'),
  (8,  'Sezione 8'),
  (9,  'Sezione 9'),
  (10, 'Sezione 10'),
  (11, 'Sezione 11'),
  (12, 'Sezione 12'),
  (13, 'Sezione 13');

-- =============================================================
-- TABELLA: candidates (17 candidati fissi, condivisi tra tutte le sezioni)
-- =============================================================
CREATE TABLE candidates (
  id         integer PRIMARY KEY,
  name       text    NOT NULL,
  is_sindaco boolean NOT NULL DEFAULT false
);

INSERT INTO candidates (id, name, is_sindaco) VALUES
  (1,  'Vincenzo Caterino',        true),
  (2,  'Maria Teresa Benadduce',   false),
  (3,  'Maria Gabriella Caterino', false),
  (4,  'Paolo Cecoro',             false),
  (5,  'Marcantonio Cecoro',       false),
  (6,  'Raffella Di Puorto',       false),
  (7,  'Silvio Di Sarno',          false),
  (8,  'Raffaele Di Tella',        false),
  (9,  'Antonio Diana',            false),
  (10, 'Mario Fabozzi',            false),
  (11, 'Paolo Infante',            false),
  (12, 'Pietro Martino',           false),
  (13, 'Stefania Parola',          false),
  (14, 'Angelo Raffaele Reccia',   false),
  (15, 'Ida Scalzone',             false),
  (16, 'Cipriano Serao',           false),
  (17, 'Filomena Zippo',           false);

-- =============================================================
-- TABELLA: votes (lista + preferenze per candidato per sezione)
-- =============================================================
CREATE TABLE votes (
  id           uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id   integer NOT NULL REFERENCES sections(id)   ON DELETE CASCADE,
  candidate_id integer NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  lista        integer NOT NULL DEFAULT 0 CHECK (lista >= 0),
  preferenze   integer NOT NULL DEFAULT 0 CHECK (preferenze >= 0),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (section_id, candidate_id)
);

-- Pre-popola 13 x 17 = 221 righe
INSERT INTO votes (section_id, candidate_id)
SELECT s.id, c.id
FROM sections s
CROSS JOIN candidates c;

-- =============================================================
-- TABELLA: section_totals (nulli, bianchi, solo sindaco per sezione)
-- =============================================================
CREATE TABLE section_totals (
  section_id   integer PRIMARY KEY REFERENCES sections(id) ON DELETE CASCADE,
  nulli        integer NOT NULL DEFAULT 0 CHECK (nulli >= 0),
  bianchi      integer NOT NULL DEFAULT 0 CHECK (bianchi >= 0),
  solo_sindaco integer NOT NULL DEFAULT 0 CHECK (solo_sindaco >= 0),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Pre-popola una riga per ogni sezione
INSERT INTO section_totals (section_id)
SELECT id FROM sections;

-- =============================================================
-- FUNZIONE e TRIGGER: aggiorna updated_at
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER votes_updated_at
  BEFORE UPDATE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER section_totals_updated_at
  BEFORE UPDATE ON section_totals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================
ALTER TABLE sections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_totals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sections_read"  ON sections  FOR SELECT TO anon USING (true);
CREATE POLICY "candidates_read" ON candidates FOR SELECT TO anon USING (true);
CREATE POLICY "votes_read"   ON votes FOR SELECT TO anon USING (true);
CREATE POLICY "votes_update" ON votes FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "totals_read"   ON section_totals FOR SELECT TO anon USING (true);
CREATE POLICY "totals_update" ON section_totals FOR UPDATE TO anon USING (true) WITH CHECK (true);
