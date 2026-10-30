-- AI Website CMS - SQLite schema (desktop / local mode)
-- Converted from schema.sql (MySQL 8). Safe to run on every start:
-- every statement is IF NOT EXISTS.
--
-- Timestamps are stored as UTC text: 'YYYY-MM-DD HH:MM:SS.mmm'
-- (the adapter turns *_at columns back into Date objects like mysql2 does).

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  status TEXT NOT NULL DEFAULT 'active',
  email_verified_at TEXT NULL,
  last_login_at TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT chk_users_role CHECK (role IN ('customer', 'admin')),
  CONSTRAINT chk_users_status CHECK (status IN ('active', 'suspended', 'pending'))
);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users (role, status);

-- 2. AUTHENTICATION AND SECURITY
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT NULL,
  ip_address TEXT NULL,
  user_agent TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  CONSTRAINT uq_sessions_token_hash UNIQUE (token_hash),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_expiry ON sessions (user_id, expires_at);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  CONSTRAINT uq_password_reset_token_hash UNIQUE (token_hash),
  CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_password_reset_user_expiry ON password_reset_tokens (user_id, expires_at);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  CONSTRAINT uq_email_verification_token_hash UNIQUE (token_hash),
  CONSTRAINT fk_email_verification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_email_verification_user_expiry ON email_verification_tokens (user_id, expires_at);

-- 3. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NULL,
  framework TEXT NOT NULL DEFAULT 'nextjs',
  status TEXT NOT NULL DEFAULT 'draft',
  visibility TEXT NOT NULL DEFAULT 'private',
  platform_subdomain TEXT NULL,
  current_version_number INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  deleted_at TEXT NULL,
  CONSTRAINT uq_projects_slug UNIQUE (slug),
  CONSTRAINT uq_projects_subdomain UNIQUE (platform_subdomain),
  CONSTRAINT fk_projects_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT chk_projects_status CHECK (
    status IN ('draft','generating','ready','published','archived','failed')
  ),
  CONSTRAINT chk_projects_visibility CHECK (visibility IN ('private', 'public'))
);
CREATE INDEX IF NOT EXISTS idx_projects_owner_updated ON projects (owner_user_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);

-- 4. PROJECT VERSIONS
CREATE TABLE IF NOT EXISTS project_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  version_number INTEGER NOT NULL,
  created_by_user_id INTEGER NULL,
  source_prompt TEXT NULL,
  summary TEXT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  CONSTRAINT uq_project_versions_number UNIQUE (project_id, version_number),
  CONSTRAINT fk_project_versions_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_project_versions_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_project_versions_status CHECK (status IN ('draft', 'ready', 'published', 'failed'))
);
CREATE INDEX IF NOT EXISTS idx_project_versions_created ON project_versions (project_id, created_at);

-- 5. GENERATED PROJECT FILES
CREATE TABLE IF NOT EXISTS project_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_version_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  content TEXT NOT NULL,
  content_sha256 TEXT NULL,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  CONSTRAINT uq_project_files_version_path UNIQUE (project_version_id, file_path),
  CONSTRAINT fk_project_files_version FOREIGN KEY (project_version_id) REFERENCES project_versions(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_project_files_version ON project_files (project_version_id);

-- 6. AI GENERATION JOBS
CREATE TABLE IF NOT EXISTS generation_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  requested_by_user_id INTEGER NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  progress_percent INTEGER NOT NULL DEFAULT 0,
  result_version_id INTEGER NULL,
  error_code TEXT NULL,
  error_message TEXT NULL,
  started_at TEXT NULL,
  finished_at TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  CONSTRAINT fk_generation_jobs_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_generation_jobs_requester FOREIGN KEY (requested_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_generation_jobs_result_version FOREIGN KEY (result_version_id) REFERENCES project_versions(id) ON DELETE SET NULL,
  CONSTRAINT chk_generation_jobs_status CHECK (
    status IN ('queued','running','succeeded','failed','cancelled')
  ),
  CONSTRAINT chk_generation_jobs_progress CHECK (progress_percent BETWEEN 0 AND 100)
);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_project_created ON generation_jobs (project_id, created_at);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_status_created ON generation_jobs (status, created_at);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_requester ON generation_jobs (requested_by_user_id, created_at);

-- 7. PROJECT DATABASE CONNECTION METADATA
CREATE TABLE IF NOT EXISTS project_databases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  provider TEXT NOT NULL DEFAULT 'mysql',
  database_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  connection_secret_ciphertext TEXT NULL,
  last_checked_at TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  CONSTRAINT uq_project_databases_project UNIQUE (project_id),
  CONSTRAINT uq_project_databases_name UNIQUE (database_name),
  CONSTRAINT fk_project_databases_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT chk_project_databases_status CHECK (status IN ('pending', 'ready', 'failed', 'disabled'))
);

-- 8. DEPLOYMENTS
CREATE TABLE IF NOT EXISTS deployments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  project_version_id INTEGER NOT NULL,
  created_by_user_id INTEGER NOT NULL,
  target TEXT NOT NULL DEFAULT 'platform',
  status TEXT NOT NULL DEFAULT 'queued',
  deployment_url TEXT NULL,
  build_id TEXT NULL,
  log_excerpt TEXT NULL,
  error_code TEXT NULL,
  started_at TEXT NULL,
  finished_at TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  CONSTRAINT fk_deployments_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_deployments_version FOREIGN KEY (project_version_id) REFERENCES project_versions(id) ON DELETE RESTRICT,
  CONSTRAINT fk_deployments_creator FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT chk_deployments_target CHECK (target IN ('platform', 'custom')),
  CONSTRAINT chk_deployments_status CHECK (
    status IN ('queued','building','deploying','succeeded','failed','cancelled')
  )
);
CREATE INDEX IF NOT EXISTS idx_deployments_project_created ON deployments (project_id, created_at);
CREATE INDEX IF NOT EXISTS idx_deployments_status_created ON deployments (status, created_at);

-- 9. CUSTOM DOMAINS
CREATE TABLE IF NOT EXISTS domains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  domain_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  verification_token_hash TEXT NULL,
  verified_at TEXT NULL,
  tls_status TEXT NOT NULL DEFAULT 'pending',
  last_checked_at TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  CONSTRAINT uq_domains_name UNIQUE (domain_name),
  CONSTRAINT fk_domains_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT chk_domains_status CHECK (status IN ('pending','verified','active','failed','removed')),
  CONSTRAINT chk_domains_tls_status CHECK (tls_status IN ('pending','active','failed','not_applicable'))
);
CREATE INDEX IF NOT EXISTS idx_domains_project_status ON domains (project_id, status);

-- 10. USAGE EVENTS
CREATE TABLE IF NOT EXISTS usage_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  project_id INTEGER NULL,
  event_type TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'count',
  metadata TEXT NULL,
  occurred_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  CONSTRAINT fk_usage_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_usage_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_usage_user_time ON usage_events (user_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_usage_project_time ON usage_events (project_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_usage_type_time ON usage_events (event_type, occurred_at);

-- 11. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  provider TEXT NOT NULL DEFAULT 'stripe',
  provider_customer_id TEXT NULL,
  provider_subscription_id TEXT NULL,
  plan_code TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TEXT NULL,
  current_period_end TEXT NULL,
  cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  CONSTRAINT uq_subscriptions_provider_subscription UNIQUE (provider, provider_subscription_id),
  CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT chk_subscriptions_status CHECK (
    status IN ('trialing','active','past_due','cancelled','incomplete','inactive')
  )
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions (user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions (provider, provider_customer_id);

-- 12. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  subscription_id INTEGER NULL,
  provider TEXT NOT NULL DEFAULT 'stripe',
  provider_payment_id TEXT NULL,
  provider_event_id TEXT NULL,
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT NULL,
  paid_at TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  CONSTRAINT uq_payments_provider_payment UNIQUE (provider, provider_payment_id),
  CONSTRAINT uq_payments_provider_event UNIQUE (provider, provider_event_id),
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payments_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
  CONSTRAINT chk_payments_status CHECK (
    status IN ('pending','succeeded','failed','refunded','cancelled')
  )
);
CREATE INDEX IF NOT EXISTS idx_payments_user_created ON payments (user_id, created_at);

-- 13. SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS support_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  assigned_admin_user_id INTEGER NULL,
  resolved_at TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  CONSTRAINT fk_support_tickets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_support_tickets_assignee FOREIGN KEY (assigned_admin_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_support_tickets_status CHECK (
    status IN ('open','in_progress','waiting_for_user','resolved','closed')
  ),
  CONSTRAINT chk_support_tickets_priority CHECK (priority IN ('low','normal','high','urgent'))
);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status_priority ON support_tickets (status, priority, created_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_created ON support_tickets (user_id, created_at);

-- 14. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_user_id INTEGER NULL,
  project_id INTEGER NULL,
  action TEXT NOT NULL,
  resource_type TEXT NULL,
  resource_id TEXT NULL,
  request_id TEXT NULL,
  ip_address TEXT NULL,
  metadata TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f','now')),
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_audit_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_actor_time ON audit_logs (actor_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_project_time ON audit_logs (project_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_action_time ON audit_logs (action, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_request ON audit_logs (request_id);

-- ON UPDATE CURRENT_TIMESTAMP(3) emulation (MySQL did this automatically)
-- Only fires when the UPDATE did not set updated_at itself.

CREATE TRIGGER IF NOT EXISTS trg_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE users SET updated_at = strftime('%Y-%m-%d %H:%M:%f','now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_projects_updated_at
AFTER UPDATE ON projects
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE projects SET updated_at = strftime('%Y-%m-%d %H:%M:%f','now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_project_files_updated_at
AFTER UPDATE ON project_files
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE project_files SET updated_at = strftime('%Y-%m-%d %H:%M:%f','now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_generation_jobs_updated_at
AFTER UPDATE ON generation_jobs
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE generation_jobs SET updated_at = strftime('%Y-%m-%d %H:%M:%f','now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_project_databases_updated_at
AFTER UPDATE ON project_databases
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE project_databases SET updated_at = strftime('%Y-%m-%d %H:%M:%f','now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_domains_updated_at
AFTER UPDATE ON domains
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE domains SET updated_at = strftime('%Y-%m-%d %H:%M:%f','now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_subscriptions_updated_at
AFTER UPDATE ON subscriptions
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE subscriptions SET updated_at = strftime('%Y-%m-%d %H:%M:%f','now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_payments_updated_at
AFTER UPDATE ON payments
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE payments SET updated_at = strftime('%Y-%m-%d %H:%M:%f','now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_support_tickets_updated_at
AFTER UPDATE ON support_tickets
FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE support_tickets SET updated_at = strftime('%Y-%m-%d %H:%M:%f','now') WHERE id = NEW.id;
END;
