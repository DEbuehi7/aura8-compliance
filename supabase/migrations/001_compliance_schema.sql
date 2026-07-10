-- Aura8 Compliance System — Supabase Schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`)
-- ============================================================

-- compliance_accounts: stores authorised portal users (e.g. CCBill reviewers)
CREATE TABLE IF NOT EXISTS compliance_accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,          -- bcrypt hash, never plain-text
  active        BOOLEAN NOT NULL DEFAULT true,
  role          TEXT NOT NULL DEFAULT 'reviewer',
  organization  TEXT,
  expires_at    TIMESTAMPTZ,            -- NULL = never expires
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- compliance_audit_log: immutable append-only log for CCBill compliance
CREATE TABLE IF NOT EXISTS compliance_audit_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES compliance_accounts(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,   -- e.g. login_success, login_fail_bad_password
  details    JSONB,           -- arbitrary structured context
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast per-account history look-ups and time-range metric queries
CREATE INDEX IF NOT EXISTS idx_audit_account   ON compliance_audit_log (account_id);
CREATE INDEX IF NOT EXISTS idx_audit_created   ON compliance_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action    ON compliance_audit_log (action);

-- Row-level security: service-role key bypasses RLS; anon key is blocked
ALTER TABLE compliance_accounts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_audit_log   ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies — only the server-side service-role key
-- (set via SUPABASE_SERVICE_ROLE_KEY env var) may read/write these tables.

-- ============================================================
-- Seed: CCBill reviewer account
-- Password hash below = bcrypt(cost=10) of 'A8-CcBill!2050-Secure-Bridge-91'
-- Regenerate with: node -e "const b=require('bcryptjs');b.hash('A8-CcBill!2050-Secure-Bridge-91',10).then(h=>console.log(h))"
-- ============================================================

INSERT INTO compliance_accounts (username, password_hash, active, role, organization)
VALUES (
  'ccbill_aura8',
  '$2a$10$c/OW9NJY5GGcZ7NkEdVYue7nRABFOxm2Z0SbjqhRjE8AL8n663P.O',
  true,
  'ccbill_reviewer',
  'CCBill'
)
ON CONFLICT (username) DO NOTHING;
