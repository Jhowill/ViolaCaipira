import { describe, expect, it } from "vitest";

import { createDatabaseClient } from "@/database/client";
import { DEFAULT_MIGRATIONS } from "@/database/migrations";
import { INITIAL_SCHEMA_SQL, INITIAL_SCHEMA_STATEMENTS } from "@/database/schema";
import { SYSTEM_META_KEYS } from "@/database/schema/system";
import { createFakeDatabase } from "@/database/__tests__/fakes";

const now = () => "2026-07-12T12:00:00.000Z";

describe("initial database schema", () => {
  it("contains the system, catalog and user tables required by T09/T10", () => {
    expect(DEFAULT_MIGRATIONS).toHaveLength(1);
    expect(DEFAULT_MIGRATIONS[0]?.version).toBe(1);
    expect(INITIAL_SCHEMA_STATEMENTS.length).toBeGreaterThan(20);
    expect(INITIAL_SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS system_catalog_releases");
    expect(INITIAL_SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS system_integrity_events");
    expect(INITIAL_SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS catalog_tunings");
    expect(INITIAL_SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS catalog_chord_shapes");
    expect(INITIAL_SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS catalog_songs");
    expect(INITIAL_SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS user_profile");
    expect(INITIAL_SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS user_song_preferences");
    expect(INITIAL_SCHEMA_SQL).toContain("CREATE TABLE IF NOT EXISTS user_recent_items");
    expect(INITIAL_SCHEMA_SQL).toContain("CREATE INDEX IF NOT EXISTS idx_tuning_alias_normalized");
    expect(INITIAL_SCHEMA_SQL).toContain("CREATE INDEX IF NOT EXISTS idx_shapes_tuning_chord");
    expect(INITIAL_SCHEMA_SQL).toContain("CREATE INDEX IF NOT EXISTS idx_catalog_songs_title");
    expect(INITIAL_SCHEMA_SQL).toContain("CREATE INDEX IF NOT EXISTS idx_user_songs_title");
    expect(INITIAL_SCHEMA_SQL).toContain("CREATE UNIQUE INDEX IF NOT EXISTS idx_user_song_drafts_active");
    expect(INITIAL_SCHEMA_SQL).toContain("CHECK (fret BETWEEN -1 AND 30)");
    expect(INITIAL_SCHEMA_SQL).toContain("UNIQUE (shape_id, physical_string_number)");
  });

  it("aplica a migration inicial em um banco vazio", async () => {
    const fakeDatabase = createFakeDatabase();
    const client = await createDatabaseClient({
      database: fakeDatabase,
      now,
      installationId: "installation-test",
    });

    const result = await client.migrate();

    expect(result.applied.map((migration) => migration.version)).toEqual([1]);
    expect(fakeDatabase.state.systemMeta[SYSTEM_META_KEYS.installationId]?.value).toBe("installation-test");
    expect(
      fakeDatabase.state.execStatements.some((statement) =>
        statement.includes("CREATE TABLE IF NOT EXISTS catalog_chord_shapes"),
      ),
    ).toBe(true);
    expect(
      fakeDatabase.state.execStatements.some((statement) =>
        statement.includes("CREATE TABLE IF NOT EXISTS user_app_preferences"),
      ),
    ).toBe(true);
    expect(
      fakeDatabase.state.execStatements.some((statement) =>
        statement.includes("CREATE UNIQUE INDEX IF NOT EXISTS idx_user_song_drafts_active"),
      ),
    ).toBe(true);
    expect(fakeDatabase.state.appliedMigrations).toHaveLength(1);
  });
});
