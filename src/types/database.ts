export type DatabasePlatform = "android" | "ios" | "web" | "native" | "unknown";

export interface DatabaseRunResult {
  readonly lastInsertRowId: number;
  readonly changes: number;
}

export interface SQLiteDatabaseLike {
  readonly execAsync: (source: string) => Promise<void>;
  readonly runAsync: (source: string, ...params: readonly unknown[]) => Promise<DatabaseRunResult>;
  readonly getFirstAsync: <T = Readonly<Record<string, unknown>>>(
    source: string,
    ...params: readonly unknown[]
  ) => Promise<T | null>;
  readonly getAllAsync: <T = Readonly<Record<string, unknown>>>(
    source: string,
    ...params: readonly unknown[]
  ) => Promise<readonly T[]>;
  readonly withTransactionAsync: <T>(task: () => Promise<T>) => Promise<T>;
  readonly withExclusiveTransactionAsync?: <T>(task: () => Promise<T>) => Promise<T>;
  readonly closeAsync?: () => Promise<void>;
}

export interface MigrationDefinition {
  readonly version: number;
  readonly name: string;
  readonly checksum: string;
  readonly up: (database: SQLiteDatabaseLike) => Promise<void>;
  readonly validate?: (database: SQLiteDatabaseLike) => Promise<void>;
}

export interface AppliedMigrationRecord {
  readonly id: string;
  readonly version: number;
  readonly name: string;
  readonly checksum: string;
  readonly appliedAt: string;
  readonly executionMs: number | null;
}

export interface MigrationRunResult {
  readonly applied: readonly AppliedMigrationRecord[];
  readonly skipped: readonly MigrationDefinition[];
  readonly latestVersion: number | null;
}

export interface SystemMetaRecord {
  readonly key: string;
  readonly value: string;
  readonly updatedAt: string;
}

export interface DatabaseClientOptions {
  readonly databaseName?: string;
  readonly database?: SQLiteDatabaseLike;
  readonly openDatabaseAsync?: (databaseName: string) => Promise<SQLiteDatabaseLike>;
  readonly migrations?: readonly MigrationDefinition[];
  readonly platform?: DatabasePlatform;
  readonly now?: () => string;
  readonly installationId?: string;
}

export interface DatabaseClient {
  readonly database: SQLiteDatabaseLike;
  readonly migrate: () => Promise<MigrationRunResult>;
  readonly transaction: <T>(
    task: (database: SQLiteDatabaseLike) => Promise<T>,
    options?: { readonly exclusive?: boolean },
  ) => Promise<T>;
  readonly close: () => Promise<void>;
}

export interface SystemBootstrapOptions {
  readonly now?: () => string;
  readonly installationId?: string;
}
