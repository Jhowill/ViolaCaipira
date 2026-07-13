import { buildPaginationWindow } from "@/database/queries";
import { withDatabaseTransaction } from "@/database/transaction";
import { toRepositoryError } from "@/repositories/contracts";
import type { SQLiteDatabaseLike } from "@/types/database";
import type { ContentOrigin, EntityRef, JsonObject } from "@/types/music";

import type { FavoriteEntityType } from "@/repositories/favoritesRepository";

export type RecentEntityType = FavoriteEntityType;
export type RecentRef = EntityRef<RecentEntityType>;

export interface RecentRecord {
  readonly ref: RecentRef;
  readonly openedAt: string;
  readonly openCount: number;
  readonly context: JsonObject | null;
}

export interface RecentFilters {
  readonly entityType?: RecentEntityType | "all";
  readonly entityOrigin?: ContentOrigin | "all";
  readonly limit?: number;
  readonly offset?: number;
}

export interface RecentRepository {
  list(filters?: RecentFilters): Promise<readonly RecentRecord[]>;
  getByRef(ref: RecentRef): Promise<RecentRecord | null>;
  recordOpen(ref: RecentRef, context?: JsonObject | null): Promise<RecentRecord | null>;
  cleanup(): Promise<number>;
}

interface RecentRow {
  readonly id: string;
  readonly entity_type: RecentEntityType;
  readonly entity_origin: ContentOrigin;
  readonly entity_id: string;
  readonly opened_at: string;
  readonly open_count: number;
  readonly context_json: string | null;
}

interface EntityExistsRow {
  readonly id: string;
}

const DEFAULT_RECENT_LIMIT = 100;

const RECENT_LIMITS: Readonly<Record<RecentEntityType, number>> = {
  song: 50,
  chord_shape: 50,
  rhythm: 20,
  tuning: 20,
  exercise: 20,
};

const SELECT_RECENTS_SQL = `
SELECT
  id,
  entity_type,
  entity_origin,
  entity_id,
  opened_at,
  open_count,
  context_json
FROM user_recent_items
WHERE 1 = 1
`.trim();

const SELECT_RECENT_BY_REF_SQL = `
SELECT
  id,
  entity_type,
  entity_origin,
  entity_id,
  opened_at,
  open_count,
  context_json
FROM user_recent_items
WHERE entity_type = ? AND entity_origin = ? AND entity_id = ?
LIMIT 1
`.trim();

const INSERT_RECENT_SQL = `
INSERT INTO user_recent_items (
  id,
  entity_type,
  entity_origin,
  entity_id,
  opened_at,
  open_count,
  context_json
) VALUES (?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(entity_type, entity_origin, entity_id) DO UPDATE SET
  opened_at = excluded.opened_at,
  open_count = user_recent_items.open_count + 1,
  context_json = COALESCE(excluded.context_json, user_recent_items.context_json)
`.trim();

const DELETE_RECENT_BY_REF_SQL = `
DELETE FROM user_recent_items
WHERE entity_type = ? AND entity_origin = ? AND entity_id = ?
`.trim();

const SELECT_CATALOG_TUNING_SQL = "SELECT id FROM catalog_tunings WHERE id = ? LIMIT 1";
const SELECT_USER_TUNING_SQL = "SELECT id FROM user_tunings WHERE id = ? AND deleted_at IS NULL LIMIT 1";
const SELECT_CATALOG_CHORD_SHAPE_SQL = "SELECT id FROM catalog_chord_shapes WHERE id = ? LIMIT 1";
const SELECT_USER_CHORD_SHAPE_SQL = "SELECT id FROM user_chord_shapes WHERE id = ? AND deleted_at IS NULL LIMIT 1";
const SELECT_CATALOG_SONG_SQL = "SELECT id FROM catalog_songs WHERE id = ? LIMIT 1";
const SELECT_USER_SONG_SQL = "SELECT id FROM user_songs WHERE id = ? AND deleted_at IS NULL LIMIT 1";
const SELECT_CATALOG_RHYTHM_SQL = "SELECT id FROM catalog_rhythms WHERE id = ? LIMIT 1";
const SELECT_CATALOG_EXERCISE_SQL = "SELECT id FROM catalog_exercises WHERE id = ? LIMIT 1";

function createNowProvider(now?: () => string): () => string {
  return now ?? (() => new Date().toISOString());
}

function createIdFactory(factory?: () => string): () => string {
  if (factory) {
    return factory;
  }

  return () => globalThis.crypto?.randomUUID?.() ?? `recent-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseJsonObject(value: string | null): JsonObject | null {
  if (value === null) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return null;
    }

    return parsed as JsonObject;
  } catch {
    return null;
  }
}

function normalizeRecentRow(row: RecentRow): RecentRecord {
  return {
    ref: {
      type: row.entity_type,
      origin: row.entity_origin,
      id: row.entity_id,
    },
    openedAt: row.opened_at,
    openCount: row.open_count,
    context: parseJsonObject(row.context_json),
  };
}

function recentKey(ref: RecentRef): string {
  return `${ref.type}:${ref.origin}:${ref.id}`;
}

async function entityExists(database: SQLiteDatabaseLike, ref: RecentRef): Promise<boolean> {
  let sql: string | null = null;

  switch (ref.type) {
    case "tuning":
      sql = ref.origin === "catalog" ? SELECT_CATALOG_TUNING_SQL : SELECT_USER_TUNING_SQL;
      break;
    case "chord_shape":
      sql = ref.origin === "catalog" ? SELECT_CATALOG_CHORD_SHAPE_SQL : SELECT_USER_CHORD_SHAPE_SQL;
      break;
    case "song":
      sql = ref.origin === "catalog" ? SELECT_CATALOG_SONG_SQL : SELECT_USER_SONG_SQL;
      break;
    case "rhythm":
      if (ref.origin !== "catalog") {
        return false;
      }

      sql = SELECT_CATALOG_RHYTHM_SQL;
      break;
    case "exercise":
      if (ref.origin !== "catalog") {
        return false;
      }

      sql = SELECT_CATALOG_EXERCISE_SQL;
      break;
  }

  if (!sql) {
    return false;
  }

  const row = await database.getFirstAsync<EntityExistsRow>(sql, ref.id);
  return row !== null;
}

async function loadRecentRows(
  database: SQLiteDatabaseLike,
  filters: RecentFilters = {},
): Promise<readonly RecentRow[]> {
  const window = buildPaginationWindow({
    limit: filters.limit,
    offset: filters.offset,
    fallbackLimit: DEFAULT_RECENT_LIMIT,
  });

  let sql = SELECT_RECENTS_SQL;
  const params: unknown[] = [];

  if (filters.entityType && filters.entityType !== "all") {
    sql += " AND entity_type = ?";
    params.push(filters.entityType);
  }

  if (filters.entityOrigin && filters.entityOrigin !== "all") {
    sql += " AND entity_origin = ?";
    params.push(filters.entityOrigin);
  }

  sql += " ORDER BY opened_at DESC, open_count DESC, entity_type ASC, entity_origin ASC, entity_id ASC, id ASC LIMIT ? OFFSET ?";
  params.push(window.limit, window.offset);

  return database.getAllAsync<RecentRow>(sql, ...params);
}

async function loadRecentRowByRef(database: SQLiteDatabaseLike, ref: RecentRef): Promise<RecentRow | null> {
  return database.getFirstAsync<RecentRow>(SELECT_RECENT_BY_REF_SQL, ref.type, ref.origin, ref.id);
}

async function deleteRecentRowsByRef(database: SQLiteDatabaseLike, ref: RecentRef): Promise<void> {
  await database.runAsync(DELETE_RECENT_BY_REF_SQL, ref.type, ref.origin, ref.id);
}

async function pruneRecentRows(
  database: SQLiteDatabaseLike,
  entityType: RecentEntityType,
  limit: number,
): Promise<number> {
  const rows = await database.getAllAsync<RecentRow>(SELECT_RECENTS_SQL + " AND entity_type = ? ORDER BY opened_at DESC, open_count DESC, entity_origin ASC, entity_id ASC, id ASC", entityType);

  if (rows.length <= limit) {
    return 0;
  }

  let removed = 0;
  for (const row of rows.slice(limit)) {
    await database.runAsync(DELETE_RECENT_BY_REF_SQL, row.entity_type, row.entity_origin, row.entity_id);
    removed += 1;
  }

  return removed;
}

export function createRecentRepository(
  database: SQLiteDatabaseLike,
  options: {
    readonly now?: () => string;
    readonly idFactory?: () => string;
    readonly limits?: Partial<Record<RecentEntityType, number>>;
  } = {},
): RecentRepository {
  const now = createNowProvider(options.now);
  const idFactory = createIdFactory(options.idFactory);
  const limits = {
    ...RECENT_LIMITS,
    ...options.limits,
  } as Readonly<Record<RecentEntityType, number>>;

  async function getByRef(ref: RecentRef): Promise<RecentRecord | null> {
    try {
      const row = await loadRecentRowByRef(database, ref);
      if (!row) {
        return null;
      }

      if (!(await entityExists(database, ref))) {
        return null;
      }

      return normalizeRecentRow(row);
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", `Unable to load recent item ${recentKey(ref)}.`);
    }
  }

  async function list(filters: RecentFilters = {}): Promise<readonly RecentRecord[]> {
    try {
      const rows = await loadRecentRows(database, filters);
      const records: RecentRecord[] = [];

      for (const row of rows) {
        const ref: RecentRef = {
          type: row.entity_type,
          origin: row.entity_origin,
          id: row.entity_id,
        };

        if (!(await entityExists(database, ref))) {
          continue;
        }

        try {
          records.push(normalizeRecentRow(row));
        } catch {
          continue;
        }
      }

      return records;
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to list recent items.");
    }
  }

  async function recordOpen(ref: RecentRef, context: JsonObject | null = null): Promise<RecentRecord | null> {
    try {
      return await withDatabaseTransaction(
        database,
        async (transactionalDatabase) => {
          const exists = await entityExists(transactionalDatabase, ref);
          if (!exists) {
            await deleteRecentRowsByRef(transactionalDatabase, ref);
            return null;
          }

          const current = await loadRecentRowByRef(transactionalDatabase, ref);
          const nextTimestamp = now();
          const nextOpenCount = current ? current.open_count + 1 : 1;
          const nextContextJson = context === null ? current?.context_json ?? null : JSON.stringify(context);

          await transactionalDatabase.runAsync(
            INSERT_RECENT_SQL,
            current?.id ?? idFactory(),
            ref.type,
            ref.origin,
            ref.id,
            nextTimestamp,
            nextOpenCount,
            nextContextJson,
          );

          await pruneRecentRows(transactionalDatabase, ref.type, limits[ref.type]);

          const stored = await loadRecentRowByRef(transactionalDatabase, ref);
          return stored ? normalizeRecentRow(stored) : null;
        },
        { exclusive: true },
      );
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", `Unable to record recent item ${recentKey(ref)}.`);
    }
  }

  async function cleanup(): Promise<number> {
    try {
      return await withDatabaseTransaction(
        database,
        async (transactionalDatabase) => {
          const rows = await transactionalDatabase.getAllAsync<RecentRow>(SELECT_RECENTS_SQL);
          let removed = 0;

          for (const row of rows) {
            const ref: RecentRef = {
              type: row.entity_type,
              origin: row.entity_origin,
              id: row.entity_id,
            };

            if (await entityExists(transactionalDatabase, ref)) {
              continue;
            }

            await deleteRecentRowsByRef(transactionalDatabase, ref);
            removed += 1;
          }

          for (const entityType of Object.keys(limits) as RecentEntityType[]) {
            removed += await pruneRecentRows(transactionalDatabase, entityType, limits[entityType]);
          }

          return removed;
        },
        { exclusive: true },
      );
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to clean up recent items.");
    }
  }

  return {
    list,
    getByRef,
    recordOpen,
    cleanup,
  };
}
