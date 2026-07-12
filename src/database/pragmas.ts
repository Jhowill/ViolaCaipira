import type { DatabasePlatform, SQLiteDatabaseLike } from "@/types/database";

export const SQLITE_PRAGMA_STATEMENTS = [
  "PRAGMA foreign_keys = ON;",
  "PRAGMA journal_mode = WAL;",
  "PRAGMA synchronous = NORMAL;",
  "PRAGMA temp_store = MEMORY;",
  "PRAGMA busy_timeout = 5000;",
] as const;

export function getSqlitePragmaStatements(_platform: DatabasePlatform = "unknown"): readonly string[] {
  return SQLITE_PRAGMA_STATEMENTS;
}

export function buildSqlitePragmaSql(platform: DatabasePlatform = "unknown"): string {
  return getSqlitePragmaStatements(platform).join("\n");
}

export async function applySqlitePragmas(
  database: SQLiteDatabaseLike,
  platform: DatabasePlatform = "unknown",
): Promise<void> {
  await database.execAsync(buildSqlitePragmaSql(platform));
}
