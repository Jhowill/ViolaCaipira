import type { AppliedMigrationRecord, SQLiteDatabaseLike } from "@/types/database";

import {
  SYSTEM_MIGRATIONS_INSERT_SQL,
  SYSTEM_MIGRATIONS_SELECT_SQL,
  SYSTEM_META_SELECT_SQL,
  SYSTEM_META_UPSERT_SQL,
} from "@/database/schema/system";

export interface FakeSystemMetaEntry {
  readonly value: string;
  readonly updatedAt: string;
}

export interface FakeDatabaseState {
  readonly execStatements: string[];
  readonly runStatements: Array<{ readonly sql: string; readonly params: readonly unknown[] }>;
  readonly appliedMigrations: AppliedMigrationRecord[];
  readonly systemMeta: Record<string, FakeSystemMetaEntry>;
}

export interface FakeDatabase extends SQLiteDatabaseLike {
  readonly state: FakeDatabaseState;
}

function normalizeSql(source: string): string {
  return source.replace(/\s+/g, " ").trim().toLowerCase();
}

function cloneState(state: FakeDatabaseState): FakeDatabaseState {
  return {
    execStatements: [...state.execStatements],
    runStatements: state.runStatements.map((entry) => ({
      sql: entry.sql,
      params: [...entry.params],
    })),
    appliedMigrations: state.appliedMigrations.map((migration) => ({ ...migration })),
    systemMeta: Object.fromEntries(
      Object.entries(state.systemMeta).map(([key, entry]) => [key, { ...entry }] as const),
    ),
  };
}

function createState(initialState: Partial<FakeDatabaseState> = {}): FakeDatabaseState {
  return {
    execStatements: initialState.execStatements ? [...initialState.execStatements] : [],
    runStatements: initialState.runStatements
      ? initialState.runStatements.map((entry) => ({ sql: entry.sql, params: [...entry.params] }))
      : [],
    appliedMigrations: initialState.appliedMigrations
      ? initialState.appliedMigrations.map((migration) => ({ ...migration }))
      : [],
    systemMeta: initialState.systemMeta
      ? Object.fromEntries(
          Object.entries(initialState.systemMeta).map(([key, entry]) => [key, { ...entry }] as const),
        )
      : {},
  };
}

export function createFakeDatabase(initialState: Partial<FakeDatabaseState> = {}): FakeDatabase {
  let state = createState(initialState);

  const applyRunStatement = (sql: string, params: readonly unknown[]): void => {
    state.runStatements.push({ sql, params: [...params] });

    if (normalizeSql(sql) === normalizeSql(SYSTEM_MIGRATIONS_INSERT_SQL)) {
      const [id, version, name, checksum, appliedAt, executionMs] = params;
      state.appliedMigrations.push({
        id: String(id),
        version: Number(version),
        name: String(name),
        checksum: String(checksum),
        appliedAt: String(appliedAt),
        executionMs: executionMs === null || executionMs === undefined ? null : Number(executionMs),
      });
      return;
    }

    if (normalizeSql(sql) === normalizeSql(SYSTEM_META_UPSERT_SQL)) {
      const [key, value, updatedAt] = params;
      state.systemMeta[String(key)] = {
        value: String(value),
        updatedAt: String(updatedAt),
      };
    }
  };

  const readSystemMeta = (key: string): { readonly key: string; readonly value: string; readonly updatedAt: string } | null => {
    const entry = state.systemMeta[key];

    if (!entry) {
      return null;
    }

    return {
      key,
      value: entry.value,
      updatedAt: entry.updatedAt,
    };
  };

  const database: FakeDatabase = {
    get state() {
      return state;
    },
    execAsync(source: string): Promise<void> {
      state.execStatements.push(source);
      return Promise.resolve();
    },
    runAsync(source: string, ...params: readonly unknown[]): Promise<{ readonly lastInsertRowId: number; readonly changes: number }> {
      applyRunStatement(source, params);

      return Promise.resolve({
        lastInsertRowId: state.appliedMigrations.length,
        changes: 1,
      });
    },
    getFirstAsync<T = Readonly<Record<string, unknown>>>(
      source: string,
      ...params: readonly unknown[]
    ): Promise<T | null> {
      const normalized = normalizeSql(source);

      if (normalized === normalizeSql(SYSTEM_META_SELECT_SQL)) {
        const key = typeof params[0] === "string" ? params[0] : "";
        return Promise.resolve(readSystemMeta(key) as T | null);
      }

      return Promise.resolve(null);
    },
    getAllAsync<T = Readonly<Record<string, unknown>>>(
      source: string,
      ..._params: readonly unknown[]
    ): Promise<readonly T[]> {
      if (normalizeSql(source) === normalizeSql(SYSTEM_MIGRATIONS_SELECT_SQL)) {
        const rows = state.appliedMigrations.map((migration) => ({ ...migration }));
        return Promise.resolve(rows as unknown as readonly T[]);
      }

      const emptyRows: readonly T[] = [];
      return Promise.resolve(emptyRows);
    },
    async withTransactionAsync<T>(task: () => Promise<T>): Promise<T> {
      const snapshot = cloneState(state);

      try {
        return await task();
      } catch (error) {
        state = snapshot;
        throw error;
      }
    },
    withExclusiveTransactionAsync<T>(task: () => Promise<T>): Promise<T> {
      return database.withTransactionAsync(task);
    },
    closeAsync(): Promise<void> {
      return Promise.resolve();
    },
  };

  return database;
}
