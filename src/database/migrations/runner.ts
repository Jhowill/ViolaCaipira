import type {
  AppliedMigrationRecord,
  MigrationDefinition,
  MigrationRunResult,
  SQLiteDatabaseLike,
} from "@/types/database";

import {
  SYSTEM_MIGRATIONS_INSERT_SQL,
  SYSTEM_MIGRATIONS_SELECT_SQL,
} from "@/database/schema/system";
import { withDatabaseTransaction } from "@/database/transaction";

export class MigrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MigrationError";
  }
}

export function sortMigrations(migrations: readonly MigrationDefinition[]): readonly MigrationDefinition[] {
  const sorted = [...migrations].sort((left, right) => left.version - right.version);
  const seen = new Set<number>();

  for (const migration of sorted) {
    if (!Number.isInteger(migration.version) || migration.version <= 0) {
      throw new MigrationError(`Invalid migration version: ${migration.version}`);
    }

    if (seen.has(migration.version)) {
      throw new MigrationError(`Duplicate migration version: ${migration.version}`);
    }

    if (migration.name.trim().length === 0) {
      throw new MigrationError(`Migration ${migration.version} is missing a name.`);
    }

    if (migration.checksum.trim().length === 0) {
      throw new MigrationError(`Migration ${migration.version} is missing a checksum.`);
    }

    seen.add(migration.version);
  }

  return sorted;
}

export async function readAppliedMigrations(database: SQLiteDatabaseLike): Promise<readonly AppliedMigrationRecord[]> {
  const rows = await database.getAllAsync<AppliedMigrationRecord>(SYSTEM_MIGRATIONS_SELECT_SQL);
  return [...rows].sort((left, right) => left.version - right.version);
}

function buildMigrationId(migration: MigrationDefinition): string {
  const normalizedName = migration.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `migration-${migration.version}-${normalizedName || "unnamed"}`;
}

async function recordMigration(
  database: SQLiteDatabaseLike,
  migration: MigrationDefinition,
  appliedAt: string,
  executionMs: number,
): Promise<void> {
  await database.runAsync(
    SYSTEM_MIGRATIONS_INSERT_SQL,
    buildMigrationId(migration),
    migration.version,
    migration.name,
    migration.checksum,
    appliedAt,
    executionMs,
  );
}

export async function runMigrations(
  database: SQLiteDatabaseLike,
  migrations: readonly MigrationDefinition[],
  options: {
    readonly now: () => string;
  },
): Promise<MigrationRunResult> {
  const sortedMigrations = sortMigrations(migrations);
  const appliedMigrations = await readAppliedMigrations(database);
  const appliedByVersion = new Map(appliedMigrations.map((migration) => [migration.version, migration] as const));
  const applied: AppliedMigrationRecord[] = [];
  const skipped: MigrationDefinition[] = [];

  for (const migration of sortedMigrations) {
    const existing = appliedByVersion.get(migration.version);

    if (existing) {
      if (existing.checksum !== migration.checksum) {
        throw new MigrationError(
          `Migration version ${migration.version} already exists with a different checksum.`,
        );
      }

      skipped.push(migration);
      continue;
    }

    const startedAt = performance.now();
    const appliedAt = options.now();

    await withDatabaseTransaction(
      database,
      async (transactionalDatabase) => {
        await migration.up(transactionalDatabase);

        if (migration.validate) {
          await migration.validate(transactionalDatabase);
        }

        const executionMs = Math.max(0, Math.round(performance.now() - startedAt));
        await recordMigration(transactionalDatabase, migration, appliedAt, executionMs);
      },
      { exclusive: true },
    );

    const executionMs = Math.max(0, Math.round(performance.now() - startedAt));
    applied.push({
      id: buildMigrationId(migration),
      version: migration.version,
      name: migration.name,
      checksum: migration.checksum,
      appliedAt,
      executionMs,
    });
  }

  const latestVersion = [...appliedMigrations, ...applied].reduce<number | null>((latest, migration) => {
    if (latest === null) {
      return migration.version;
    }

    return Math.max(latest, migration.version);
  }, null);

  return {
    applied,
    skipped,
    latestVersion,
  };
}
