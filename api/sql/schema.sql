-- AI Website CMS initial local MySQL schema
-- Target: MySQL 8.0+ / InnoDB
--
-- Run from the repository root:
--   mysql -u root -p < api/sql/schema.sql
--
-- This is an initial schema, not a migration system.
-- Never store real secrets in this file.

CREATE DATABASE ai_cms
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ai_cms;


-- =========================================================
-- 1. USERS
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  role VARCHAR(24) NOT NULL DEFAULT 'customer',
  status VARCHAR(24) NOT NULL DEFAULT 'active',
  email_verified_at DATETIME(3) NULL,
  last_login_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_status (role, status),

  CONSTRAINT chk_users_role
    CHECK (role IN ('customer', 'admin')),

  CONSTRAINT chk_users_status
    CHECK (status IN ('active', 'suspended', 'pending'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 2. AUTHENTICATION AND SECURITY
-- =========================================================

CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  revoked_at DATETIME(3) NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(512) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  UNIQUE KEY uq_sessions_token_hash (token_hash),
  KEY idx_sessions_user_expiry (user_id, expires_at),

  CONSTRAINT fk_sessions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  used_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  UNIQUE KEY uq_password_reset_token_hash (token_hash),
  KEY idx_password_reset_user_expiry (user_id, expires_at),

  CONSTRAINT fk_password_reset_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  used_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  UNIQUE KEY uq_email_verification_token_hash (token_hash),
  KEY idx_email_verification_user_expiry (user_id, expires_at),

  CONSTRAINT fk_email_verification_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 3. PROJECTS
-- =========================================================

CREATE TABLE IF NOT EXISTS projects (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  owner_user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT NULL,
  framework VARCHAR(50) NOT NULL DEFAULT 'nextjs',
  status VARCHAR(24) NOT NULL DEFAULT 'draft',
  visibility VARCHAR(24) NOT NULL DEFAULT 'private',
  platform_subdomain VARCHAR(100) NULL,
  current_version_number INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_projects_slug (slug),
  UNIQUE KEY uq_projects_subdomain (platform_subdomain),
  KEY idx_projects_owner_updated (owner_user_id, updated_at),
  KEY idx_projects_status (status),

  CONSTRAINT fk_projects_owner
    FOREIGN KEY (owner_user_id) REFERENCES users(id)
    ON DELETE RESTRICT,

  CONSTRAINT chk_projects_status
    CHECK (
      status IN (
        'draft',
        'generating',
        'ready',
        'published',
        'archived',
        'failed'
      )
    ),

  CONSTRAINT chk_projects_visibility
    CHECK (visibility IN ('private', 'public'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 4. PROJECT VERSIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS project_versions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  version_number INT UNSIGNED NOT NULL,
  created_by_user_id BIGINT UNSIGNED NULL,
  source_prompt TEXT NULL,
  summary MEDIUMTEXT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'draft',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  UNIQUE KEY uq_project_versions_number (project_id, version_number),
  KEY idx_project_versions_created (project_id, created_at),

  CONSTRAINT fk_project_versions_project
    FOREIGN KEY (project_id) REFERENCES projects(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_project_versions_creator
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
    ON DELETE SET NULL,

  CONSTRAINT chk_project_versions_status
    CHECK (status IN ('draft', 'ready', 'published', 'failed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 5. GENERATED PROJECT FILES
-- =========================================================

CREATE TABLE IF NOT EXISTS project_files (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_version_id BIGINT UNSIGNED NOT NULL,
  file_path VARCHAR(512) NOT NULL,
  content LONGTEXT NOT NULL,
  content_sha256 CHAR(64) NULL,
  size_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  UNIQUE KEY uq_project_files_version_path
    (project_version_id, file_path),
  KEY idx_project_files_version (project_version_id),

  CONSTRAINT fk_project_files_version
    FOREIGN KEY (project_version_id) REFERENCES project_versions(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 6. AI GENERATION JOBS
-- =========================================================

CREATE TABLE IF NOT EXISTS generation_jobs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  requested_by_user_id BIGINT UNSIGNED NOT NULL,
  provider VARCHAR(40) NOT NULL,
  model VARCHAR(120) NOT NULL,
  prompt LONGTEXT NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'queued',
  progress_percent TINYINT UNSIGNED NOT NULL DEFAULT 0,
  result_version_id BIGINT UNSIGNED NULL,
  error_code VARCHAR(100) NULL,
  error_message TEXT NULL,
  started_at DATETIME(3) NULL,
  finished_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  KEY idx_generation_jobs_project_created (project_id, created_at),
  KEY idx_generation_jobs_status_created (status, created_at),
  KEY idx_generation_jobs_requester (requested_by_user_id, created_at),

  CONSTRAINT fk_generation_jobs_project
    FOREIGN KEY (project_id) REFERENCES projects(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_generation_jobs_requester
    FOREIGN KEY (requested_by_user_id) REFERENCES users(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_generation_jobs_result_version
    FOREIGN KEY (result_version_id) REFERENCES project_versions(id)
    ON DELETE SET NULL,

  CONSTRAINT chk_generation_jobs_status
    CHECK (
      status IN (
        'queued',
        'running',
        'succeeded',
        'failed',
        'cancelled'
      )
    ),

  CONSTRAINT chk_generation_jobs_progress
    CHECK (progress_percent <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 7. PROJECT DATABASE CONNECTION METADATA
-- =========================================================

CREATE TABLE IF NOT EXISTS project_databases (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  provider VARCHAR(40) NOT NULL DEFAULT 'mysql',
  database_name VARCHAR(64) NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'pending',
  connection_secret_ciphertext MEDIUMTEXT NULL
    COMMENT 'Application-encrypted connection data only; never plaintext',
  last_checked_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  UNIQUE KEY uq_project_databases_project (project_id),
  UNIQUE KEY uq_project_databases_name (database_name),

  CONSTRAINT fk_project_databases_project
    FOREIGN KEY (project_id) REFERENCES projects(id)
    ON DELETE CASCADE,

  CONSTRAINT chk_project_databases_status
    CHECK (status IN ('pending', 'ready', 'failed', 'disabled'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 8. DEPLOYMENTS
-- =========================================================

CREATE TABLE IF NOT EXISTS deployments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  project_version_id BIGINT UNSIGNED NOT NULL,
  created_by_user_id BIGINT UNSIGNED NOT NULL,
  target VARCHAR(24) NOT NULL DEFAULT 'platform',
  status VARCHAR(24) NOT NULL DEFAULT 'queued',
  deployment_url VARCHAR(2048) NULL,
  build_id VARCHAR(255) NULL,
  log_excerpt TEXT NULL
    COMMENT 'Redacted diagnostic excerpt only; do not store secrets',
  error_code VARCHAR(100) NULL,
  started_at DATETIME(3) NULL,
  finished_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  KEY idx_deployments_project_created (project_id, created_at),
  KEY idx_deployments_status_created (status, created_at),

  CONSTRAINT fk_deployments_project
    FOREIGN KEY (project_id) REFERENCES projects(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_deployments_version
    FOREIGN KEY (project_version_id) REFERENCES project_versions(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_deployments_creator
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
    ON DELETE RESTRICT,

  CONSTRAINT chk_deployments_target
    CHECK (target IN ('platform', 'custom')),

  CONSTRAINT chk_deployments_status
    CHECK (
      status IN (
        'queued',
        'building',
        'deploying',
        'succeeded',
        'failed',
        'cancelled'
      )
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 9. CUSTOM DOMAINS
-- =========================================================

CREATE TABLE IF NOT EXISTS domains (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  domain_name VARCHAR(253) NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'pending',
  verification_token_hash CHAR(64) NULL,
  verified_at DATETIME(3) NULL,
  tls_status VARCHAR(24) NOT NULL DEFAULT 'pending',
  last_checked_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  UNIQUE KEY uq_domains_name (domain_name),
  KEY idx_domains_project_status (project_id, status),

  CONSTRAINT fk_domains_project
    FOREIGN KEY (project_id) REFERENCES projects(id)
    ON DELETE CASCADE,

  CONSTRAINT chk_domains_status
    CHECK (
      status IN ('pending', 'verified', 'active', 'failed', 'removed')
    ),

  CONSTRAINT chk_domains_tls_status
    CHECK (
      tls_status IN ('pending', 'active', 'failed', 'not_applicable')
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 10. USAGE EVENTS
-- =========================================================

CREATE TABLE IF NOT EXISTS usage_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  project_id BIGINT UNSIGNED NULL,
  event_type VARCHAR(64) NOT NULL,
  quantity DECIMAL(18,6) NOT NULL DEFAULT 1,
  unit VARCHAR(40) NOT NULL DEFAULT 'count',
  metadata JSON NULL,
  occurred_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  KEY idx_usage_user_time (user_id, occurred_at),
  KEY idx_usage_project_time (project_id, occurred_at),
  KEY idx_usage_type_time (event_type, occurred_at),

  CONSTRAINT fk_usage_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_usage_project
    FOREIGN KEY (project_id) REFERENCES projects(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 11. SUBSCRIPTIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  provider VARCHAR(40) NOT NULL DEFAULT 'stripe',
  provider_customer_id VARCHAR(255) NULL,
  provider_subscription_id VARCHAR(255) NULL,
  plan_code VARCHAR(80) NOT NULL DEFAULT 'free',
  status VARCHAR(24) NOT NULL DEFAULT 'active',
  current_period_start DATETIME(3) NULL,
  current_period_end DATETIME(3) NULL,
  cancel_at_period_end TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  KEY idx_subscriptions_user_status (user_id, status),
  UNIQUE KEY uq_subscriptions_provider_subscription
    (provider, provider_subscription_id),
  KEY idx_subscriptions_customer (provider, provider_customer_id),

  CONSTRAINT fk_subscriptions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT,

  CONSTRAINT chk_subscriptions_status
    CHECK (
      status IN (
        'trialing',
        'active',
        'past_due',
        'cancelled',
        'incomplete',
        'inactive'
      )
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 12. PAYMENTS
-- =========================================================

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  subscription_id BIGINT UNSIGNED NULL,
  provider VARCHAR(40) NOT NULL DEFAULT 'stripe',
  provider_payment_id VARCHAR(255) NULL,
  provider_event_id VARCHAR(255) NULL,
  amount_minor BIGINT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'pending',
  description VARCHAR(500) NULL,
  paid_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  UNIQUE KEY uq_payments_provider_payment
    (provider, provider_payment_id),
  UNIQUE KEY uq_payments_provider_event
    (provider, provider_event_id),
  KEY idx_payments_user_created (user_id, created_at),

  CONSTRAINT fk_payments_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_payments_subscription
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
    ON DELETE SET NULL,

  CONSTRAINT chk_payments_status
    CHECK (
      status IN ('pending', 'succeeded', 'failed', 'refunded', 'cancelled')
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 13. SUPPORT TICKETS
-- =========================================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'open',
  priority VARCHAR(24) NOT NULL DEFAULT 'normal',
  assigned_admin_user_id BIGINT UNSIGNED NULL,
  resolved_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  KEY idx_support_tickets_status_priority (status, priority, created_at),
  KEY idx_support_tickets_user_created (user_id, created_at),

  CONSTRAINT fk_support_tickets_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_support_tickets_assignee
    FOREIGN KEY (assigned_admin_user_id) REFERENCES users(id)
    ON DELETE SET NULL,

  CONSTRAINT chk_support_tickets_status
    CHECK (
      status IN (
        'open',
        'in_progress',
        'waiting_for_user',
        'resolved',
        'closed'
      )
    ),

  CONSTRAINT chk_support_tickets_priority
    CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- 14. AUDIT LOGS
-- =========================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  actor_user_id BIGINT UNSIGNED NULL,
  project_id BIGINT UNSIGNED NULL,
  action VARCHAR(120) NOT NULL,
  resource_type VARCHAR(80) NULL,
  resource_id VARCHAR(120) NULL,
  request_id VARCHAR(100) NULL,
  ip_address VARCHAR(45) NULL,
  metadata JSON NULL
    COMMENT 'Safe metadata only; never store tokens or secret values',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (id),
  KEY idx_audit_actor_time (actor_user_id, created_at),
  KEY idx_audit_project_time (project_id, created_at),
  KEY idx_audit_action_time (action, created_at),
  KEY idx_audit_request (request_id),

  CONSTRAINT fk_audit_actor
    FOREIGN KEY (actor_user_id) REFERENCES users(id)
    ON DELETE SET NULL,

  CONSTRAINT fk_audit_project
    FOREIGN KEY (project_id) REFERENCES projects(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;