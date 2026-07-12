import type { SQLiteDatabaseLike } from "@/types/database";

export const DATABASE_NAME = "viola.db";

export const SYSTEM_META_KEYS = {
  schemaVersion: "schema_version",
  catalogVersion: "catalog_version",
  catalogSeedVersion: "catalog_seed_version",
  createdAt: "created_at",
  lastMigrationAt: "last_migration_at",
  lastIntegrityCheckAt: "last_integrity_check_at",
  installationId: "installation_id",
} as const;

export const SYSTEM_META_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS system_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);`.trim();

export const SYSTEM_MIGRATIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS system_migrations (
  id TEXT PRIMARY KEY NOT NULL,
  version INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  checksum TEXT NOT NULL,
  applied_at TEXT NOT NULL,
  execution_ms INTEGER
);`.trim();

export const SYSTEM_CATALOG_RELEASES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS system_catalog_releases (
  id TEXT PRIMARY KEY NOT NULL,
  version INTEGER NOT NULL UNIQUE,
  label TEXT NOT NULL,
  installed_at TEXT NOT NULL,
  source TEXT NOT NULL
    CHECK (source IN ('bundled', 'migration', 'future_pack')),
  checksum TEXT NOT NULL,
  item_count INTEGER NOT NULL
    CHECK (item_count >= 0)
);`.trim();

export const SYSTEM_INTEGRITY_EVENTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS system_integrity_events (
  id TEXT PRIMARY KEY NOT NULL,
  severity TEXT NOT NULL
    CHECK (severity IN ('info', 'warning', 'error')),
  code TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  resolved_at TEXT
);`.trim();

export const SYSTEM_BOOTSTRAP_SQL = [
  SYSTEM_META_TABLE_SQL,
  SYSTEM_MIGRATIONS_TABLE_SQL,
  SYSTEM_CATALOG_RELEASES_TABLE_SQL,
  SYSTEM_INTEGRITY_EVENTS_TABLE_SQL,
].join("\n\n");

export const SYSTEM_SCHEMA_STATEMENTS = [
  SYSTEM_META_TABLE_SQL,
  SYSTEM_MIGRATIONS_TABLE_SQL,
  SYSTEM_CATALOG_RELEASES_TABLE_SQL,
  SYSTEM_INTEGRITY_EVENTS_TABLE_SQL,
] as const;

export const SYSTEM_META_SELECT_SQL = `
SELECT key, value, updated_at AS updatedAt
FROM system_meta
WHERE key = ?
LIMIT 1;`.trim();

export const SYSTEM_META_UPSERT_SQL = `
INSERT INTO system_meta (key, value, updated_at)
VALUES (?, ?, ?)
ON CONFLICT(key) DO UPDATE SET
  value = excluded.value,
  updated_at = excluded.updated_at;`.trim();

export const SYSTEM_MIGRATIONS_SELECT_SQL = `
SELECT id, version, name, checksum, applied_at AS appliedAt, execution_ms AS executionMs
FROM system_migrations
ORDER BY version ASC;`.trim();

export const SYSTEM_MIGRATIONS_INSERT_SQL = `
INSERT INTO system_migrations (
  id,
  version,
  name,
  checksum,
  applied_at,
  execution_ms
)
VALUES (?, ?, ?, ?, ?, ?);`.trim();

export async function bootstrapSystemTables(database: SQLiteDatabaseLike): Promise<void> {
  await database.execAsync(SYSTEM_BOOTSTRAP_SQL);
}

export async function upsertSystemMeta(
  database: SQLiteDatabaseLike,
  key: string,
  value: string,
  updatedAt: string,
): Promise<void> {
  await database.runAsync(SYSTEM_META_UPSERT_SQL, key, value, updatedAt);
}

export async function readSystemMeta(
  database: SQLiteDatabaseLike,
  key: string,
): Promise<{ readonly key: string; readonly value: string; readonly updatedAt: string } | null> {
  return database.getFirstAsync<{ key: string; value: string; updatedAt: string }>(SYSTEM_META_SELECT_SQL, key);
}
