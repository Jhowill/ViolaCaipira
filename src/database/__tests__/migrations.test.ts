import { describe, expect, it } from "vitest";

import { createDatabaseClient } from "@/database/client";
import { SYSTEM_META_KEYS } from "@/database/schema/system";
import { createFakeDatabase } from "@/database/__tests__/fakes";
import type { MigrationDefinition } from "@/types/database";

const now = () => "2026-07-12T12:00:00.000Z";

const migrationOne: MigrationDefinition = {
  version: 1,
  name: "create alpha",
  checksum: "migration-1-alpha",
  up: async (database) => {
    await database.runAsync("INSERT INTO system_meta (key, value, updated_at) VALUES (?, ?, ?)", "alpha", "1", now());
  },
};

const migrationTwo: MigrationDefinition = {
  version: 2,
  name: "create beta",
  checksum: "migration-2-beta",
  up: async (database) => {
    await database.runAsync("INSERT INTO system_meta (key, value, updated_at) VALUES (?, ?, ?)", "beta", "2", now());
  },
};

const failingMigration: MigrationDefinition = {
  version: 3,
  name: "failing migration",
  checksum: "migration-3-failing",
  up: async (database) => {
    await database.runAsync(
      "INSERT INTO system_meta (key, value, updated_at) VALUES (?, ?, ?)",
      "temp",
      "pending",
      now(),
    );
    throw new Error("boom");
  },
};

describe("database migrations", () => {
  it("prepara um banco novo e registra migrations aplicadas", async () => {
    const fakeDatabase = createFakeDatabase();
    const client = await createDatabaseClient({
      database: fakeDatabase,
      migrations: [migrationOne],
      now,
      installationId: "installation-test",
    });

    const result = await client.migrate();

    expect(fakeDatabase.state.execStatements.some((statement) => statement.includes("PRAGMA foreign_keys = ON;"))).toBe(
      true,
    );
    expect(fakeDatabase.state.execStatements.some((statement) => statement.includes("system_migrations"))).toBe(true);
    expect(fakeDatabase.state.systemMeta[SYSTEM_META_KEYS.installationId]?.value).toBe("installation-test");
    expect(result.applied).toHaveLength(1);
    expect(result.skipped).toHaveLength(0);
    expect(result.latestVersion).toBe(1);
    expect(fakeDatabase.state.appliedMigrations).toHaveLength(1);
    expect(fakeDatabase.state.appliedMigrations[0]?.version).toBe(1);
  });

  it("pula migrations já aplicadas e executa somente as pendentes", async () => {
    const fakeDatabase = createFakeDatabase({
      appliedMigrations: [
        {
          id: "migration-1-create-alpha",
          version: 1,
          name: "create alpha",
          checksum: "migration-1-alpha",
          appliedAt: now(),
          executionMs: 3,
        },
      ],
    });

    const client = await createDatabaseClient({
      database: fakeDatabase,
      migrations: [migrationOne, migrationTwo],
      now,
      installationId: "installation-test",
    });

    const result = await client.migrate();

    expect(result.skipped.map((migration) => migration.version)).toEqual([1]);
    expect(result.applied.map((migration) => migration.version)).toEqual([2]);
    expect(fakeDatabase.state.appliedMigrations.map((migration) => migration.version)).toEqual([1, 2]);
    expect(fakeDatabase.state.systemMeta[SYSTEM_META_KEYS.installationId]?.value).toBe("installation-test");
  });

  it("faz rollback quando uma migration falha e não registra a versão", async () => {
    const fakeDatabase = createFakeDatabase();
    const client = await createDatabaseClient({
      database: fakeDatabase,
      migrations: [failingMigration],
      now,
      installationId: "installation-test",
    });

    await expect(client.migrate()).rejects.toThrow("boom");

    expect(fakeDatabase.state.appliedMigrations).toHaveLength(0);
    expect(fakeDatabase.state.systemMeta["alpha"]).toBeUndefined();
    expect(fakeDatabase.state.systemMeta["temp"]).toBeUndefined();
    expect(fakeDatabase.state.systemMeta[SYSTEM_META_KEYS.installationId]?.value).toBe("installation-test");
  });
});
