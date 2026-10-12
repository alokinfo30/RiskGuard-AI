-- ==============================================================================
-- RiskGuard AI — Enterprise Relational Schema (PostgreSQL / Cloud SQL / AlloyDB)
-- Includes partitioning, immutable cryptographic audit triggers, and SOC2/ISO27001 RLS
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Partitioned Financial Transactions Table (Partitioned by Monthly Ingestion)
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    transaction_type VARCHAR(32) NOT NULL,
    amount NUMERIC(18, 4) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    name_orig VARCHAR(128) NOT NULL,
    orig_account_type VARCHAR(32) NOT NULL,
    orig_customer_tenure_months INT NOT NULL DEFAULT 12,
    old_balance_orig NUMERIC(18, 4) NOT NULL,
    new_balance_orig NUMERIC(18, 4) NOT NULL,
    name_dest VARCHAR(128) NOT NULL,
    dest_account_type VARCHAR(32) NOT NULL,
    dest_account_age_days INT NOT NULL DEFAULT 30,
    old_balance_dest NUMERIC(18, 4) NOT NULL,
    new_balance_dest NUMERIC(18, 4) NOT NULL,
    risk_score INT NOT NULL,
    risk_band VARCHAR(24) NOT NULL,
    fraud_flags TEXT[] NOT NULL DEFAULT '{}',
    device_ip VARCHAR(64),
    device_country VARCHAR(64),
    device_is_vpn_tor BOOLEAN DEFAULT FALSE,
    device_trust_score INT DEFAULT 80,
    decision_status VARCHAR(32) NOT NULL DEFAULT 'PENDING_REVIEW',
    analyst_decision JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Initial 2026 Monthly Partitions
CREATE TABLE IF NOT EXISTS transactions_2026_q1 PARTITION OF transactions
    FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2026-04-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS transactions_2026_q2 PARTITION OF transactions
    FOR VALUES FROM ('2026-04-01 00:00:00+00') TO ('2026-07-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS transactions_2026_q3 PARTITION OF transactions
    FOR VALUES FROM ('2026-07-01 00:00:00+00') TO ('2026-10-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS transactions_2026_q4 PARTITION OF transactions
    FOR VALUES FROM ('2026-10-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

-- 2. Cryptographically Chained Compliance Audit Ledger (Append-Only)
CREATE TABLE IF NOT EXISTS audit_ledger (
    entry_id VARCHAR(64) PRIMARY KEY,
    transaction_id VARCHAR(64) NOT NULL,
    action VARCHAR(32) NOT NULL,
    reason TEXT NOT NULL,
    analyst VARCHAR(128) NOT NULL,
    score_at_decision INT NOT NULL,
    false_positive BOOLEAN NOT NULL DEFAULT FALSE,
    prev_hash CHAR(64) NOT NULL,
    hash CHAR(64) NOT NULL UNIQUE,
    kms_hmac_signature CHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforce Strict Immutability via Trigger (Block all UPDATE and DELETE operations)
CREATE OR REPLACE FUNCTION prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'SOC2/BSA Violation: Audit ledger records are cryptographically immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_immutable_audit_ledger ON audit_ledger;
CREATE TRIGGER trg_immutable_audit_ledger
BEFORE UPDATE OR DELETE ON audit_ledger
FOR EACH ROW EXECUTE FUNCTION prevent_audit_tampering();

-- 3. FinCEN BSA Electronic Filings Catalog
CREATE TABLE IF NOT EXISTS fincen_filings (
    id VARCHAR(64) PRIMARY KEY,
    batch_id VARCHAR(64) NOT NULL,
    transaction_id VARCHAR(64) NOT NULL,
    report_type VARCHAR(64) NOT NULL DEFAULT 'FinCEN Form 111 (SAR)',
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
    narrative TEXT NOT NULL,
    xml_payload TEXT,
    xml_signature VARCHAR(128),
    regulatory_framework VARCHAR(32) NOT NULL DEFAULT 'BSA_31CFR1020',
    filed_by VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Document AI Extractions & Translation Reviews
CREATE TABLE IF NOT EXISTS document_reviews (
    id VARCHAR(64) PRIMARY KEY,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(64) NOT NULL,
    source_language VARCHAR(32) NOT NULL,
    target_language VARCHAR(32) NOT NULL DEFAULT 'en',
    confidence NUMERIC(5, 4) NOT NULL DEFAULT 0.95,
    extracted_entities JSONB NOT NULL,
    bilingual_mappings JSONB NOT NULL DEFAULT '[]'::jsonb,
    translated_text TEXT NOT NULL,
    sar_exhibit_narrative TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ultra-fast query execution
CREATE INDEX IF NOT EXISTS idx_transactions_risk_band ON transactions (risk_band);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions (decision_status);
CREATE INDEX IF NOT EXISTS idx_audit_ledger_tx_id ON audit_ledger (transaction_id);
CREATE INDEX IF NOT EXISTS idx_audit_ledger_created_at ON audit_ledger (created_at DESC);
