import { quoteSqlValues } from "@/database/schema/helpers";

const SOURCE_TYPES = quoteSqlValues([
  "book",
  "article",
  "teacher",
  "musician",
  "field_research",
  "public_domain",
  "license",
  "internal",
]);

const LICENSE_TYPES = quoteSqlValues([
  "public_domain",
  "original",
  "authorized",
  "commercial",
  "educational",
  "unknown",
]);

const ASSET_TYPES = quoteSqlValues([
  "audio_note",
  "audio_chord",
  "audio_rhythm",
  "audio_count_in",
  "illustration",
  "icon",
  "document",
]);

export const CATALOG_SOURCES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_sources (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  publisher TEXT,
  publication_year INTEGER,
  source_type TEXT NOT NULL
    CHECK (source_type IN (${SOURCE_TYPES})),
  reference_text TEXT,
  external_url TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);`.trim();

export const CATALOG_LICENSES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_licenses (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  license_type TEXT NOT NULL
    CHECK (license_type IN (${LICENSE_TYPES})),
  attribution_required INTEGER NOT NULL DEFAULT 0
    CHECK (attribution_required IN (0, 1)),
  commercial_use_allowed INTEGER NOT NULL DEFAULT 0
    CHECK (commercial_use_allowed IN (0, 1)),
  modification_allowed INTEGER
    CHECK (modification_allowed IS NULL OR modification_allowed IN (0, 1)),
  valid_from TEXT,
  valid_until TEXT,
  rights_holder TEXT,
  attribution_text TEXT,
  internal_notes TEXT
);`.trim();

export const CATALOG_REVIEWERS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_reviewers (
  id TEXT PRIMARY KEY NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT,
  specialty TEXT,
  public_credit_allowed INTEGER NOT NULL DEFAULT 0
    CHECK (public_credit_allowed IN (0, 1))
);`.trim();

export const CATALOG_ASSETS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS catalog_assets (
  id TEXT PRIMARY KEY NOT NULL,
  asset_type TEXT NOT NULL
    CHECK (asset_type IN (${ASSET_TYPES})),
  local_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  duration_ms INTEGER
    CHECK (duration_ms IS NULL OR duration_ms >= 0),
  file_size_bytes INTEGER
    CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
  checksum TEXT NOT NULL,
  locale TEXT,
  is_required INTEGER NOT NULL DEFAULT 0
    CHECK (is_required IN (0, 1)),
  created_at TEXT NOT NULL
);`.trim();

export const CATALOG_FOUNDATION_STATEMENTS = [
  CATALOG_SOURCES_TABLE_SQL,
  CATALOG_LICENSES_TABLE_SQL,
  CATALOG_REVIEWERS_TABLE_SQL,
  CATALOG_ASSETS_TABLE_SQL,
] as const;
