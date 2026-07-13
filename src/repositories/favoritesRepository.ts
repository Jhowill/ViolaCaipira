import { buildPaginationWindow } from "@/database/queries";
import { withDatabaseTransaction } from "@/database/transaction";
import { toRepositoryError } from "@/repositories/contracts";
import type { SQLiteDatabaseLike } from "@/types/database";
import type { ContentOrigin, EntityRef } from "@/types/music";

export type FavoriteEntityType = "tuning" | "chord_shape" | "song" | "rhythm" | "exercise";
export type FavoriteRef = EntityRef<FavoriteEntityType>;

export interface FavoriteRecord {
  readonly ref: FavoriteRef;
  readonly createdAt: string;
}

export interface FavoriteFilters {
  readonly entityType?: FavoriteEntityType | "all";
  readonly entityOrigin?: ContentOrigin | "all";
  readonly limit?: number;
  readonly offset?: number;
}

export interface FavoritesRepository {
  list(filters?: FavoriteFilters): Promise<readonly FavoriteRecord[]>;
  getByRef(ref: FavoriteRef): Promise<FavoriteRecord | null>;
  isFavorite(ref: FavoriteRef): Promise<boolean>;
  setFavorite(ref: FavoriteRef, favorite: boolean): Promise<boolean>;
  toggleFavorite(ref: FavoriteRef): Promise<boolean>;
  cleanup(): Promise<number>;
}

interface FavoriteRow {
  readonly id: string;
  readonly entity_type: FavoriteEntityType;
  readonly entity_origin: ContentOrigin;
  readonly entity_id: string;
  readonly created_at: string;
}

interface EntityExistsRow {
  readonly id: string;
}

const DEFAULT_LIST_LIMIT = 100;

const SELECT_FAVORITES_SQL = `
SELECT
  id,
  entity_type,
  entity_origin,
  entity_id,
  created_at
FROM user_favorites
WHERE 1 = 1
`.trim();

const SELECT_FAVORITE_BY_REF_SQL = `
SELECT
  id,
  entity_type,
  entity_origin,
  entity_id,
  created_at
FROM user_favorites
WHERE entity_type = ? AND entity_origin = ? AND entity_id = ?
LIMIT 1
`.trim();

const INSERT_FAVORITE_SQL = `
INSERT INTO user_favorites (
  id,
  entity_type,
  entity_origin,
  entity_id,
  created_at
) VALUES (?, ?, ?, ?, ?)
`.trim();

const DELETE_FAVORITE_BY_REF_SQL = `
DELETE FROM user_favorites
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

  return () => globalThis.crypto?.randomUUID?.() ?? `favorite-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeFavoriteRow(row: FavoriteRow): FavoriteRecord {
  return {
    ref: {
      type: row.entity_type,
      origin: row.entity_origin,
      id: row.entity_id,
    },
    createdAt: row.created_at,
  };
}

function isFavoriteEntityType(value: string): value is FavoriteEntityType {
  return value === "tuning" || value === "chord_shape" || value === "song" || value === "rhythm" || value === "exercise";
}

async function entityExists(
  database: SQLiteDatabaseLike,
  ref: FavoriteRef,
): Promise<boolean> {
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

async function loadFavoriteRows(
  database: SQLiteDatabaseLike,
  filters: FavoriteFilters = {},
): Promise<readonly FavoriteRow[]> {
  const window = buildPaginationWindow({
    limit: filters.limit,
    offset: filters.offset,
    fallbackLimit: DEFAULT_LIST_LIMIT,
  });

  let sql = SELECT_FAVORITES_SQL;
  const params: unknown[] = [];

  if (filters.entityType && filters.entityType !== "all") {
    sql += " AND entity_type = ?";
    params.push(filters.entityType);
  }

  if (filters.entityOrigin && filters.entityOrigin !== "all") {
    sql += " AND entity_origin = ?";
    params.push(filters.entityOrigin);
  }

  sql += " ORDER BY created_at DESC, entity_type ASC, entity_origin ASC, entity_id ASC, id ASC LIMIT ? OFFSET ?";
  params.push(window.limit, window.offset);

  return database.getAllAsync<FavoriteRow>(sql, ...params);
}

async function loadFavoriteRowByRef(
  database: SQLiteDatabaseLike,
  ref: FavoriteRef,
): Promise<FavoriteRow | null> {
  return database.getFirstAsync<FavoriteRow>(SELECT_FAVORITE_BY_REF_SQL, ref.type, ref.origin, ref.id);
}

async function deleteFavoriteRowsByRef(
  database: SQLiteDatabaseLike,
  ref: FavoriteRef,
): Promise<void> {
  await database.runAsync(DELETE_FAVORITE_BY_REF_SQL, ref.type, ref.origin, ref.id);
}

export function createFavoritesRepository(
  database: SQLiteDatabaseLike,
  options: {
    readonly now?: () => string;
    readonly idFactory?: () => string;
  } = {},
): FavoritesRepository {
  const now = createNowProvider(options.now);
  const idFactory = createIdFactory(options.idFactory);

  async function getByRef(ref: FavoriteRef): Promise<FavoriteRecord | null> {
    try {
      if (!isFavoriteEntityType(ref.type)) {
        return null;
      }

      const row = await loadFavoriteRowByRef(database, ref);
      if (!row) {
        return null;
      }

      const exists = await entityExists(database, ref);
      if (!exists) {
        return null;
      }

      return normalizeFavoriteRow(row);
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", `Unable to load favorite ${ref.type}:${ref.origin}:${ref.id}.`);
    }
  }

  async function list(filters: FavoriteFilters = {}): Promise<readonly FavoriteRecord[]> {
    try {
      const rows = await loadFavoriteRows(database, filters);
      const valid: FavoriteRecord[] = [];

      for (const row of rows) {
        const ref: FavoriteRef = {
          type: row.entity_type,
          origin: row.entity_origin,
          id: row.entity_id,
        };

        if (!(await entityExists(database, ref))) {
          continue;
        }

        valid.push(normalizeFavoriteRow(row));
      }

      return valid;
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to list favorites.");
    }
  }

  async function isFavorite(ref: FavoriteRef): Promise<boolean> {
    return (await getByRef(ref)) !== null;
  }

  async function setFavorite(ref: FavoriteRef, favorite: boolean): Promise<boolean> {
    try {
      if (!isFavoriteEntityType(ref.type)) {
        return false;
      }

      if (!favorite) {
        await withDatabaseTransaction(
          database,
          async (transactionalDatabase) => {
            await deleteFavoriteRowsByRef(transactionalDatabase, ref);
          },
          { exclusive: true },
        );

        return false;
      }

      return await withDatabaseTransaction(
        database,
        async (transactionalDatabase) => {
          const exists = await entityExists(transactionalDatabase, ref);
          if (!exists) {
            await deleteFavoriteRowsByRef(transactionalDatabase, ref);
            return false;
          }

          const existing = await loadFavoriteRowByRef(transactionalDatabase, ref);
          if (existing) {
            return true;
          }

          await transactionalDatabase.runAsync(
            INSERT_FAVORITE_SQL,
            idFactory(),
            ref.type,
            ref.origin,
            ref.id,
            now(),
          );

          return true;
        },
        { exclusive: true },
      );
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", `Unable to update favorite ${ref.type}:${ref.origin}:${ref.id}.`);
    }
  }

  async function toggleFavorite(ref: FavoriteRef): Promise<boolean> {
    const next = !(await isFavorite(ref));
    return setFavorite(ref, next);
  }

  async function cleanup(): Promise<number> {
    try {
      return await withDatabaseTransaction(
        database,
        async (transactionalDatabase) => {
          const rows = await transactionalDatabase.getAllAsync<FavoriteRow>(SELECT_FAVORITES_SQL);
          let removed = 0;

          for (const row of rows) {
            const ref: FavoriteRef = {
              type: row.entity_type,
              origin: row.entity_origin,
              id: row.entity_id,
            };

            if (await entityExists(transactionalDatabase, ref)) {
              continue;
            }

            await deleteFavoriteRowsByRef(transactionalDatabase, ref);
            removed += 1;
          }

          return removed;
        },
        { exclusive: true },
      );
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to clean up favorites.");
    }
  }

  return {
    list,
    getByRef,
    isFavorite,
    setFavorite,
    toggleFavorite,
    cleanup,
  };
}
