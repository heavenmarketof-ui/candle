-- Candle CRM — estrutura inicial para Cloudflare D1.
-- Executar somente após criar e vincular o banco D1 ao projeto Pages.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS leads (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 company TEXT NOT NULL,
 phone TEXT NOT NULL,
 service TEXT NOT NULL,
 challenge TEXT NOT NULL DEFAULT '',
 stage TEXT NOT NULL DEFAULT 'novo' CHECK(stage IN ('novo','contato','diagnostico','proposta','negociacao','ganho','perdido')),
 source TEXT NOT NULL DEFAULT 'site',
 page TEXT NOT NULL DEFAULT '',
 utm_source TEXT NOT NULL DEFAULT '',
 utm_medium TEXT NOT NULL DEFAULT '',
 utm_campaign TEXT NOT NULL DEFAULT '',
 gclid TEXT NOT NULL DEFAULT '',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE TABLE IF NOT EXISTS lead_notes (
 id TEXT PRIMARY KEY,
 lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
 body TEXT NOT NULL,
 author_email TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead ON lead_notes(lead_id);
CREATE TABLE IF NOT EXISTS tasks (
 id TEXT PRIMARY KEY,
 lead_id TEXT REFERENCES leads(id) ON DELETE SET NULL,
 title TEXT NOT NULL,
 description TEXT NOT NULL DEFAULT '',
 assigned_email TEXT NOT NULL DEFAULT '',
 due_at TEXT,
 status TEXT NOT NULL DEFAULT 'pendente' CHECK(status IN ('pendente','em_andamento','concluida','cancelada')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_at,status);
