import { buildPaginationWindow } from "@/database/queries";
import { withDatabaseTransaction } from "@/database/transaction";
import { toRepositoryError } from "@/repositories/contracts";
import type { SQLiteDatabaseLike } from "@/types/database";
import type { ContentOrigin, JsonObject } from "@/types/music";

export type ResumeType = "song" | "rhythm" | "exercise" | "draft" | "tuner_session";

export interface ResumeTarget {
  readonly resumeType: ResumeType;
  readonly entityOrigin: ContentOrigin | null;
  readonly entityId: string | null;
}

export interface ResumeStateRecord extends ResumeTarget {
  readonly id: string;
  readonly state: JsonObject;
  readonly stateJson: string;
  readonly isSafeToResume: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly expiresAt: string | null;
}

export interface ResumeStateFilters {
  readonly resumeType?: ResumeType | "all";
  readonly safeOnly?: boolean;
  readonly limit?: number;
  readonly offset?: number;
}

export interface SaveResumeStateInput extends ResumeTarget {
  readonly state: JsonObject;
  readonly isSafeToResume?: boolean;
  readonly expiresAt?: string | null;
}

export interface ResumeRepository {
  list(filters?: ResumeStateFilters): Promise<readonly ResumeStateRecord[]>;
  getByTarget(target: ResumeTarget): Promise<ResumeStateRecord | null>;
  getLatestSafe(): Promise<ResumeStateRecord | null>;
  save(input: SaveResumeStateInput): Promise<ResumeStateRecord | null>;
  clear(target: ResumeTarget): Promise<void>;
  cleanup(): Promise<number>;
}

interface ResumeRow {
  readonly id: string;
  readonly resume_type: ResumeType;
  readonly entity_origin: ContentOrigin | null;
  readonly entity_id: string | null;
  readonly state_json: string;
  readonly is_safe_to_resume: number;
  readonly created_at: string;
  readonly updated_at: string;
  readonly expires_at: string | null;
}

interface EntityExistsRow {
  readonly id: string;
}

const DEFAULT_LIST_LIMIT = 50;

const SELECT_RESUME_STATES_SQL = `
SELECT
  id,
  resume_type,
  entity_origin,
  entity_id,
  state_json,
  is_safe_to_resume,
  created_at,
  updated_at,
  expires_at
FROM user_resume_states
WHERE 1 = 1
`.trim();

const SELECT_RESUME_STATE_BY_TARGET_SQL = `
SELECT
  id,
  resume_type,
  entity_origin,
  entity_id,
  state_json,
  is_safe_to_resume,
  created_at,
  updated_at,
  expires_at
FROM user_resume_states
WHERE resume_type = ?
  AND COALESCE(entity_origin, '') = COALESCE(?, '')
  AND COALESCE(entity_id, '') = COALESCE(?, '')
ORDER BY updated_at DESC, created_at DESC, id DESC
LIMIT 1
`.trim();

const SELECT_LATEST_SAFE_RESUME_STATE_SQL = `
SELECT
  id,
  resume_type,
  entity_origin,
  entity_id,
  state_json,
  is_safe_to_resume,
  created_at,
  updated_at,
  expires_at
FROM user_resume_states
WHERE is_safe_to_resume = 1
ORDER BY updated_at DESC, created_at DESC, id DESC
LIMIT 1
`.trim();

const INSERT_RESUME_STATE_SQL = `
INSERT INTO user_resume_states (
  id,
  resume_type,
  entity_origin,
  entity_id,
  state_json,
  is_safe_to_resume,
  created_at,
  updated_at,
  expires_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`.trim();

const DELETE_RESUME_STATES_BY_TARGET_SQL = `
DELETE FROM user_resume_states
WHERE resume_type = ?
  AND COALESCE(entity_origin, '') = COALESCE(?, '')
  AND COALESCE(entity_id, '') = COALESCE(?, '')
`.trim();

const SELECT_CATALOG_SONG_SQL = "SELECT id FROM catalog_songs WHERE id = ? LIMIT 1";
const SELECT_USER_SONG_SQL = "SELECT id FROM user_songs WHERE id = ? AND deleted_at IS NULL LIMIT 1";
const SELECT_CATALOG_RHYTHM_SQL = "SELECT id FROM catalog_rhythms WHERE id = ? LIMIT 1";
const SELECT_CATALOG_EXERCISE_SQL = "SELECT id FROM catalog_exercises WHERE id = ? LIMIT 1";
const SELECT_USER_DRAFT_SQL = "SELECT id FROM user_song_drafts WHERE id = ? LIMIT 1";
const SELECT_USER_TUNING_SESSION_SQL = "SELECT id FROM user_tuning_sessions WHERE id = ? LIMIT 1";

function createNowProvider(now?: () => string): () => string {
  return now ?? (() => new Date().toISOString());
}

function createIdFactory(factory?: () => string): () => string {
  if (factory) {
    return factory;
  }

  return () => globalThis.crypto?.randomUUID?.() ?? `resume-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseJsonObject(value: string): JsonObject {
  const parsed = JSON.parse(value) as unknown;

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Resume state must be a JSON object.");
  }

  return parsed as JsonObject;
}

function normalizeResumeRow(row: ResumeRow): ResumeStateRecord {
  return {
    id: row.id,
    resumeType: row.resume_type,
    entityOrigin: row.entity_origin,
    entityId: row.entity_id,
    stateJson: row.state_json,
    state: parseJsonObject(row.state_json),
    isSafeToResume: row.is_safe_to_resume === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at,
  };
}

function resumeKey(target: ResumeTarget): string {
  return `${target.resumeType}:${target.entityOrigin ?? "null"}:${target.entityId ?? "null"}`;
}

function isExpired(row: ResumeRow, now: string): boolean {
  return row.expires_at !== null && row.expires_at <= now;
}

async function entityExists(database: SQLiteDatabaseLike, target: ResumeTarget): Promise<boolean> {
  if (target.entityId === null) {
    return false;
  }

  let sql: string | null = null;

  switch (target.resumeType) {
    case "song":
      sql = target.entityOrigin === "catalog" ? SELECT_CATALOG_SONG_SQL : target.entityOrigin === "user" ? SELECT_USER_SONG_SQL : null;
      break;
    case "rhythm":
      if (target.entityOrigin !== "catalog") {
        return false;
      }

      sql = SELECT_CATALOG_RHYTHM_SQL;
      break;
    case "exercise":
      if (target.entityOrigin !== "catalog") {
        return false;
      }

      sql = SELECT_CATALOG_EXERCISE_SQL;
      break;
    case "draft":
      sql = SELECT_USER_DRAFT_SQL;
      break;
    case "tuner_session":
      sql = SELECT_USER_TUNING_SESSION_SQL;
      break;
  }

  if (!sql) {
    return false;
  }

  const row = await database.getFirstAsync<EntityExistsRow>(sql, target.entityId);
  return row !== null;
}

async function loadResumeRows(
  database: SQLiteDatabaseLike,
  filters: ResumeStateFilters = {},
): Promise<readonly ResumeRow[]> {
  const window = buildPaginationWindow({
    limit: filters.limit,
    offset: filters.offset,
    fallbackLimit: DEFAULT_LIST_LIMIT,
  });

  let sql = SELECT_RESUME_STATES_SQL;
  const params: unknown[] = [];

  if (filters.resumeType && filters.resumeType !== "all") {
    sql += " AND resume_type = ?";
    params.push(filters.resumeType);
  }

  if (filters.safeOnly !== false) {
    sql += " AND is_safe_to_resume = 1";
  }

  sql += " ORDER BY updated_at DESC, created_at DESC, id DESC LIMIT ? OFFSET ?";
  params.push(window.limit, window.offset);

  return database.getAllAsync<ResumeRow>(sql, ...params);
}

async function loadResumeRowByTarget(database: SQLiteDatabaseLike, target: ResumeTarget): Promise<ResumeRow | null> {
  return database.getFirstAsync<ResumeRow>(SELECT_RESUME_STATE_BY_TARGET_SQL, target.resumeType, target.entityOrigin, target.entityId);
}

async function deleteResumeRowsByTarget(database: SQLiteDatabaseLike, target: ResumeTarget): Promise<void> {
  await database.runAsync(DELETE_RESUME_STATES_BY_TARGET_SQL, target.resumeType, target.entityOrigin, target.entityId);
}

async function cleanupResumeRows(database: SQLiteDatabaseLike, now: string): Promise<number> {
  const rows = await database.getAllAsync<ResumeRow>(SELECT_RESUME_STATES_SQL);
  let removed = 0;

  for (const row of rows) {
    const target: ResumeTarget = {
      resumeType: row.resume_type,
      entityOrigin: row.entity_origin,
      entityId: row.entity_id,
    };

    if (row.is_safe_to_resume !== 1 || isExpired(row, now)) {
      await deleteResumeRowsByTarget(database, target);
      removed += 1;
      continue;
    }

    try {
      parseJsonObject(row.state_json);
    } catch {
      await deleteResumeRowsByTarget(database, target);
      removed += 1;
      continue;
    }

    if (target.entityId !== null && !(await entityExists(database, target))) {
      await deleteResumeRowsByTarget(database, target);
      removed += 1;
    }
  }

  return removed;
}

export function createResumeRepository(
  database: SQLiteDatabaseLike,
  options: {
    readonly now?: () => string;
    readonly idFactory?: () => string;
  } = {},
): ResumeRepository {
  const now = createNowProvider(options.now);
  const idFactory = createIdFactory(options.idFactory);

  async function getByTarget(target: ResumeTarget): Promise<ResumeStateRecord | null> {
    try {
      const row = await loadResumeRowByTarget(database, target);
      if (!row) {
        return null;
      }

      if (row.is_safe_to_resume !== 1 || isExpired(row, now())) {
        await deleteResumeRowsByTarget(database, target);
        return null;
      }

      if (target.entityId !== null && !(await entityExists(database, target))) {
        await deleteResumeRowsByTarget(database, target);
        return null;
      }

      try {
        return normalizeResumeRow(row);
      } catch {
        await deleteResumeRowsByTarget(database, target);
        return null;
      }
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", `Unable to load resume state ${resumeKey(target)}.`);
    }
  }

  async function list(filters: ResumeStateFilters = {}): Promise<readonly ResumeStateRecord[]> {
    try {
      const rows = await loadResumeRows(database, filters);
      const results: ResumeStateRecord[] = [];

      for (const row of rows) {
        const target: ResumeTarget = {
          resumeType: row.resume_type,
          entityOrigin: row.entity_origin,
          entityId: row.entity_id,
        };

        if (target.entityId !== null && !(await entityExists(database, target))) {
          continue;
        }

        try {
          results.push(normalizeResumeRow(row));
        } catch {
          continue;
        }
      }

      return results;
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to list resume states.");
    }
  }

  async function getLatestSafe(): Promise<ResumeStateRecord | null> {
    try {
      const row = await database.getFirstAsync<ResumeRow>(SELECT_LATEST_SAFE_RESUME_STATE_SQL);
      if (!row) {
        return null;
      }

      const target: ResumeTarget = {
        resumeType: row.resume_type,
        entityOrigin: row.entity_origin,
        entityId: row.entity_id,
      };

      if (row.is_safe_to_resume !== 1 || isExpired(row, now())) {
        await deleteResumeRowsByTarget(database, target);
        return null;
      }

      if (target.entityId !== null && !(await entityExists(database, target))) {
        await deleteResumeRowsByTarget(database, target);
        return null;
      }

      try {
        return normalizeResumeRow(row);
      } catch {
        await deleteResumeRowsByTarget(database, target);
        return null;
      }
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to load the latest resume state.");
    }
  }

  async function save(input: SaveResumeStateInput): Promise<ResumeStateRecord | null> {
    try {
      if (input.isSafeToResume === false) {
        await clear(input);
        return null;
      }

      const stateJson = JSON.stringify(input.state);
      const expiresAt = input.expiresAt ?? null;

      if (input.entityId === null || !(await entityExists(database, input))) {
        await clear(input);
        return null;
      }

      return await withDatabaseTransaction(
        database,
        async (transactionalDatabase) => {
          await deleteResumeRowsByTarget(transactionalDatabase, input);

          const nowStamp = now();
          await transactionalDatabase.runAsync(
            INSERT_RESUME_STATE_SQL,
            idFactory(),
            input.resumeType,
            input.entityOrigin,
            input.entityId,
            stateJson,
            1,
            nowStamp,
            nowStamp,
            expiresAt,
          );

          const stored = await loadResumeRowByTarget(transactionalDatabase, input);
          return stored ? normalizeResumeRow(stored) : null;
        },
        { exclusive: true },
      );
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", `Unable to save resume state ${resumeKey(input)}.`);
    }
  }

  async function clear(target: ResumeTarget): Promise<void> {
    try {
      await withDatabaseTransaction(
        database,
        async (transactionalDatabase) => {
          await deleteResumeRowsByTarget(transactionalDatabase, target);
        },
        { exclusive: true },
      );
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", `Unable to clear resume state ${resumeKey(target)}.`);
    }
  }

  async function cleanup(): Promise<number> {
    try {
      return await withDatabaseTransaction(
        database,
        async (transactionalDatabase) => cleanupResumeRows(transactionalDatabase, now()),
        { exclusive: true },
      );
    } catch (error) {
      throw toRepositoryError(error, "DATABASE_ERROR", "Unable to clean up resume states.");
    }
  }

  return {
    list,
    getByTarget,
    getLatestSafe,
    save,
    clear,
    cleanup,
  };
}
