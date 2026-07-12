import type { DatabaseClient, DatabaseClientOptions, SQLiteDatabaseLike } from "@/types/database";

import { applySqlitePragmas } from "@/database/pragmas";
import { DEFAULT_MIGRATIONS, runMigrations } from "@/database/migrations";
import {
  DATABASE_NAME,
  SYSTEM_META_KEYS,
  bootstrapSystemTables,
  readSystemMeta,
  upsertSystemMeta,
} from "@/database/schema/system";
import { withDatabaseTransaction } from "@/database/transaction";

async function openDefaultDatabase(databaseName: string): Promise<SQLiteDatabaseLike> {
  const sqlite = await import("expo-sqlite");
  return (await sqlite.openDatabaseAsync(databaseName)) as SQLiteDatabaseLike;
}

function createNowProvider(now?: () => string): () => string {
  if (now) {
    return now;
  }

  return () => new Date().toISOString();
}

function createInstallationId(): string {
  const randomUuid = globalThis.crypto?.randomUUID?.();

  if (randomUuid) {
    return randomUuid;
  }

  return `installation-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function createDatabaseClient(options: DatabaseClientOptions = {}): Promise<DatabaseClient> {
  const databaseName = options.databaseName ?? DATABASE_NAME;
  const now = createNowProvider(options.now);
  const database = options.database ?? (await (options.openDatabaseAsync ?? openDefaultDatabase)(databaseName));
  const migrations = options.migrations ?? DEFAULT_MIGRATIONS;
  const platform = options.platform ?? "unknown";

  await applySqlitePragmas(database, platform);
  await bootstrapSystemTables(database);

  const existingInstallation = await readSystemMeta(database, SYSTEM_META_KEYS.installationId);
  const installationId = options.installationId ?? existingInstallation?.value ?? createInstallationId();

  await withDatabaseTransaction(
    database,
    async (transactionalDatabase) => {
      await upsertSystemMeta(transactionalDatabase, "installation_id", installationId, now());
    },
    { exclusive: true },
  );

  return {
    database,
    migrate: async () => runMigrations(database, migrations, { now }),
    transaction: async <T>(
      task: (transactionalDatabase: SQLiteDatabaseLike) => Promise<T>,
      transactionOptions = {},
    ) => withDatabaseTransaction(database, task, transactionOptions),
    close: async () => {
      if (database.closeAsync) {
        await database.closeAsync();
      }
    },
  };
}

let appDatabaseClientPromise: Promise<DatabaseClient> | null = null;

/**
 * Returns the single migrated database connection used by the running app.
 * Tests and maintenance tools should keep using createDatabaseClient directly.
 */
export function getAppDatabaseClient(): Promise<DatabaseClient> {
  if (!appDatabaseClientPromise) {
    appDatabaseClientPromise = createDatabaseClient()
      .then(async (client) => {
        await client.migrate();
        return client;
      })
      .catch((error: unknown) => {
        appDatabaseClientPromise = null;
        throw error;
      });
  }

  return appDatabaseClientPromise;
}

export async function resetAppDatabaseClient(): Promise<void> {
  const pendingClient = appDatabaseClientPromise;
  appDatabaseClientPromise = null;

  if (pendingClient) {
    const client = await pendingClient;
    await client.close();
  }
}
