import type { SQLiteDatabaseLike } from "@/types/database";
import type { ContentOrigin } from "@/types/music";

import type { FavoriteEntityType } from "@/repositories/favoritesRepository";
import type { RecentEntityType } from "@/repositories/recentRepository";
import type { ResumeType } from "@/repositories/resumeRepository";

export interface T16EntityRow {
  readonly id: string;
  readonly deleted_at?: string | null;
}

export interface T16FavoriteRow {
  readonly id: string;
  readonly entity_type: FavoriteEntityType;
  readonly entity_origin: ContentOrigin;
  readonly entity_id: string;
  readonly created_at: string;
}

export interface T16RecentRow {
  readonly id: string;
  readonly entity_type: RecentEntityType;
  readonly entity_origin: ContentOrigin;
  readonly entity_id: string;
  readonly opened_at: string;
  readonly open_count: number;
  readonly context_json: string | null;
}

export interface T16ResumeRow {
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

export interface T16DatabaseState {
  readonly catalogTunings: T16EntityRow[];
  readonly userTunings: T16EntityRow[];
  readonly catalogChordShapes: T16EntityRow[];
  readonly userChordShapes: T16EntityRow[];
  readonly catalogSongs: T16EntityRow[];
  readonly userSongs: T16EntityRow[];
  readonly catalogRhythms: T16EntityRow[];
  readonly catalogExercises: T16EntityRow[];
  readonly userSongDrafts: T16EntityRow[];
  readonly userTuningSessions: T16EntityRow[];
  readonly userFavorites: T16FavoriteRow[];
  readonly userRecentItems: T16RecentRow[];
  readonly userResumeStates: T16ResumeRow[];
}

function normalizeSql(source: string): string {
  return source.replace(/\s+/g, " ").trim().toLowerCase();
}

function cloneState(state: T16DatabaseState): T16DatabaseState {
  return structuredClone(state);
}

function isLiveRow(row: T16EntityRow): boolean {
  return row.deleted_at === undefined || row.deleted_at === null;
}

function findEntityRow(rows: readonly T16EntityRow[], id: string): T16EntityRow | null {
  return rows.find((row) => row.id === id && isLiveRow(row)) ?? null;
}

function sortByCreatedAtDesc<T extends { readonly created_at: string }>(rows: readonly T[]): T[] {
  return [...rows].sort((left, right) => right.created_at.localeCompare(left.created_at));
}

function sortRecentRows(rows: readonly T16RecentRow[]): T16RecentRow[] {
  return [...rows].sort((left, right) => {
    if (left.opened_at !== right.opened_at) {
      return right.opened_at.localeCompare(left.opened_at);
    }

    if (left.open_count !== right.open_count) {
      return right.open_count - left.open_count;
    }

    if (left.entity_type !== right.entity_type) {
      return left.entity_type.localeCompare(right.entity_type);
    }

    if (left.entity_origin !== right.entity_origin) {
      return left.entity_origin.localeCompare(right.entity_origin);
    }

    return left.entity_id.localeCompare(right.entity_id) || left.id.localeCompare(right.id);
  });
}

function sortResumeRows(rows: readonly T16ResumeRow[]): T16ResumeRow[] {
  return [...rows].sort((left, right) => {
    if (left.updated_at !== right.updated_at) {
      return right.updated_at.localeCompare(left.updated_at);
    }

    if (left.created_at !== right.created_at) {
      return right.created_at.localeCompare(left.created_at);
    }

    return right.id.localeCompare(left.id);
  });
}

export function buildT16DatabaseState(overrides: Partial<T16DatabaseState> = {}): T16DatabaseState {
  return {
    catalogTunings: overrides.catalogTunings ?? [{ id: "catalog-tuning-1" }],
    userTunings: overrides.userTunings ?? [{ id: "user-tuning-1", deleted_at: null }],
    catalogChordShapes: overrides.catalogChordShapes ?? [{ id: "catalog-shape-1" }],
    userChordShapes: overrides.userChordShapes ?? [{ id: "user-shape-1", deleted_at: null }],
    catalogSongs: overrides.catalogSongs ?? [{ id: "catalog-song-1" }],
    userSongs: overrides.userSongs ?? [{ id: "user-song-1", deleted_at: null }],
    catalogRhythms: overrides.catalogRhythms ?? [{ id: "catalog-rhythm-1" }],
    catalogExercises: overrides.catalogExercises ?? [{ id: "catalog-exercise-1" }],
    userSongDrafts: overrides.userSongDrafts ?? [{ id: "draft-1" }],
    userTuningSessions: overrides.userTuningSessions ?? [{ id: "session-1" }],
    userFavorites: overrides.userFavorites ?? [],
    userRecentItems: overrides.userRecentItems ?? [],
    userResumeStates: overrides.userResumeStates ?? [],
  };
}

export function createT16Database(
  overrides: Partial<T16DatabaseState> = {},
): SQLiteDatabaseLike & { readonly state: T16DatabaseState } {
  let state = buildT16DatabaseState(overrides);

  function mutate<T>(task: () => T): T {
    const snapshot = cloneState(state);
    try {
      return task();
    } catch (error) {
      state = snapshot;
      throw error;
    }
  }

  function applyRun(sql: string, params: readonly unknown[]): void {
    const normalized = normalizeSql(sql);

    if (normalized.includes("insert into user_favorites")) {
      const [id, entityType, entityOrigin, entityId, createdAt] = params as [
        string,
        FavoriteEntityType,
        ContentOrigin,
        string,
        string,
      ];
      const key = `${entityType}:${entityOrigin}:${entityId}`;
      if (state.userFavorites.some((row) => `${row.entity_type}:${row.entity_origin}:${row.entity_id}` === key)) {
        throw new Error("UNIQUE constraint failed: user_favorites.entity_type, user_favorites.entity_origin, user_favorites.entity_id");
      }

      state = {
        ...state,
        userFavorites: [
          ...state.userFavorites,
          {
            id,
            entity_type: entityType,
            entity_origin: entityOrigin,
            entity_id: entityId,
            created_at: createdAt,
          },
        ],
      };
      return;
    }

    if (normalized.includes("delete from user_favorites")) {
      const [entityType, entityOrigin, entityId] = params as [FavoriteEntityType, ContentOrigin, string];
      state = {
        ...state,
        userFavorites: state.userFavorites.filter(
          (row) =>
            !(row.entity_type === entityType &&
            row.entity_origin === entityOrigin &&
            row.entity_id === entityId),
        ),
      };
      return;
    }

    if (normalized.includes("insert into user_recent_items")) {
      const [id, entityType, entityOrigin, entityId, openedAt, openCount, contextJson] = params as [
        string,
        RecentEntityType,
        ContentOrigin,
        string,
        string,
        number,
        string | null,
      ];
      const key = `${entityType}:${entityOrigin}:${entityId}`;
      const existing = state.userRecentItems.find((row) => `${row.entity_type}:${row.entity_origin}:${row.entity_id}` === key);

      if (existing) {
        state = {
          ...state,
          userRecentItems: state.userRecentItems.map((row) =>
            `${row.entity_type}:${row.entity_origin}:${row.entity_id}` === key
                ? {
                  ...row,
                  opened_at: openedAt,
                  open_count: openCount,
                  context_json: contextJson === undefined ? row.context_json : contextJson,
                }
              : row,
          ),
        };
        return;
      }

      state = {
        ...state,
        userRecentItems: [
          ...state.userRecentItems,
          {
            id,
            entity_type: entityType,
            entity_origin: entityOrigin,
            entity_id: entityId,
            opened_at: openedAt,
            open_count: openCount,
            context_json: contextJson === undefined ? null : contextJson,
          },
        ],
      };
      return;
    }

    if (normalized.includes("delete from user_recent_items")) {
      const [entityType, entityOrigin, entityId] = params as [RecentEntityType, ContentOrigin, string];
      state = {
        ...state,
        userRecentItems: state.userRecentItems.filter(
          (row) =>
            !(row.entity_type === entityType &&
            row.entity_origin === entityOrigin &&
            row.entity_id === entityId),
        ),
      };
      return;
    }

    if (normalized.includes("insert into user_resume_states")) {
      const [id, resumeType, entityOrigin, entityId, stateJson, isSafeToResume, createdAt, updatedAt, expiresAt] = params as [
        string,
        ResumeType,
        ContentOrigin | null,
        string | null,
        string,
        number,
        string,
        string,
        string | null,
      ];
      state = {
        ...state,
        userResumeStates: [
          ...state.userResumeStates,
          {
            id,
            resume_type: resumeType,
            entity_origin: entityOrigin,
            entity_id: entityId,
            state_json: stateJson,
            is_safe_to_resume: isSafeToResume,
            created_at: createdAt,
            updated_at: updatedAt,
            expires_at: expiresAt === undefined ? null : expiresAt,
          },
        ],
      };
      return;
    }

    if (normalized.includes("delete from user_resume_states")) {
      const [resumeType, entityOrigin, entityId] = params as [ResumeType, ContentOrigin | null, string | null];
      state = {
        ...state,
        userResumeStates: state.userResumeStates.filter(
          (row) =>
            !(
              row.resume_type === resumeType &&
              row.entity_origin === entityOrigin &&
              row.entity_id === entityId
            ),
        ),
      };
      return;
    }
  }

  function filterByFavoriteParams(rows: readonly T16FavoriteRow[], sql: string, params: readonly unknown[]): T16FavoriteRow[] {
    const result = [...rows];
    let cursor = 0;

    if (sql.includes("entity_type = ?")) {
      const entityType = params[cursor++] as FavoriteEntityType;
      result.splice(0, result.length, ...result.filter((row) => row.entity_type === entityType));
    }

    if (sql.includes("entity_origin = ?")) {
      const entityOrigin = params[cursor++] as ContentOrigin;
      result.splice(0, result.length, ...result.filter((row) => row.entity_origin === entityOrigin));
    }

    return result;
  }

  function filterByRecentParams(rows: readonly T16RecentRow[], sql: string, params: readonly unknown[]): T16RecentRow[] {
    const result = [...rows];
    let cursor = 0;

    if (sql.includes("entity_type = ?")) {
      const entityType = params[cursor++] as RecentEntityType;
      result.splice(0, result.length, ...result.filter((row) => row.entity_type === entityType));
    }

    if (sql.includes("entity_origin = ?")) {
      const entityOrigin = params[cursor++] as ContentOrigin;
      result.splice(0, result.length, ...result.filter((row) => row.entity_origin === entityOrigin));
    }

    return result;
  }

  function filterByResumeParams(rows: readonly T16ResumeRow[], sql: string, params: readonly unknown[]): T16ResumeRow[] {
    const result = [...rows];
    let cursor = 0;

    if (sql.includes("resume_type = ?")) {
      const resumeType = params[cursor++] as ResumeType;
      result.splice(0, result.length, ...result.filter((row) => row.resume_type === resumeType));
    }

    if (sql.includes("coalesce(entity_origin, '') = coalesce(?, '')")) {
      const entityOrigin = params[cursor++] as ContentOrigin | null;
      result.splice(0, result.length, ...result.filter((row) => row.entity_origin === entityOrigin));
    }

    if (sql.includes("coalesce(entity_id, '') = coalesce(?, '')")) {
      const entityId = params[cursor++] as string | null;
      result.splice(0, result.length, ...result.filter((row) => row.entity_id === entityId));
    }

    if (sql.includes("is_safe_to_resume = 1")) {
      result.splice(0, result.length, ...result.filter((row) => row.is_safe_to_resume === 1));
    }

    return result;
  }

  function sliceWithWindow<T>(rows: readonly T[], params: readonly unknown[]): T[] {
    if (params.length < 2) {
      return [...rows];
    }

    const limit = Number(params[params.length - 2]);
    const offset = Number(params[params.length - 1]);
    return [...rows].slice(offset, offset + limit);
  }

  const database: SQLiteDatabaseLike & { readonly state: T16DatabaseState } = {
    get state() {
      return state;
    },
    execAsync(): Promise<void> {
      return Promise.resolve();
    },
    runAsync(source: string, ...params: readonly unknown[]): Promise<{ readonly lastInsertRowId: number; readonly changes: number }> {
      mutate(() => applyRun(source, params));
      return Promise.resolve({
        lastInsertRowId: 1,
        changes: 1,
      });
    },
    getFirstAsync<T = Readonly<Record<string, unknown>>>(source: string, ...params: readonly unknown[]): Promise<T | null> {
      const normalized = normalizeSql(source);

      if (normalized.includes("from catalog_tunings") && normalized.includes("where id = ?")) {
        const row = findEntityRow(state.catalogTunings, params[0] as string);
        return Promise.resolve((row as unknown as T) ?? null);
      }

      if (normalized.includes("from user_tunings") && normalized.includes("where id = ?")) {
        const row = findEntityRow(state.userTunings, params[0] as string);
        return Promise.resolve((row as unknown as T) ?? null);
      }

      if (normalized.includes("from catalog_chord_shapes") && normalized.includes("where id = ?")) {
        const row = findEntityRow(state.catalogChordShapes, params[0] as string);
        return Promise.resolve((row as unknown as T) ?? null);
      }

      if (normalized.includes("from user_chord_shapes") && normalized.includes("where id = ?")) {
        const row = findEntityRow(state.userChordShapes, params[0] as string);
        return Promise.resolve((row as unknown as T) ?? null);
      }

      if (normalized.includes("from catalog_songs") && normalized.includes("where id = ?")) {
        const row = findEntityRow(state.catalogSongs, params[0] as string);
        return Promise.resolve((row as unknown as T) ?? null);
      }

      if (normalized.includes("from user_songs") && normalized.includes("where id = ?")) {
        const row = findEntityRow(state.userSongs, params[0] as string);
        return Promise.resolve((row as unknown as T) ?? null);
      }

      if (normalized.includes("from catalog_rhythms") && normalized.includes("where id = ?")) {
        const row = findEntityRow(state.catalogRhythms, params[0] as string);
        return Promise.resolve((row as unknown as T) ?? null);
      }

      if (normalized.includes("from catalog_exercises") && normalized.includes("where id = ?")) {
        const row = findEntityRow(state.catalogExercises, params[0] as string);
        return Promise.resolve((row as unknown as T) ?? null);
      }

      if (normalized.includes("from user_song_drafts") && normalized.includes("where id = ?")) {
        const row = findEntityRow(state.userSongDrafts, params[0] as string);
        return Promise.resolve((row as unknown as T) ?? null);
      }

      if (normalized.includes("from user_tuning_sessions") && normalized.includes("where id = ?")) {
        const row = findEntityRow(state.userTuningSessions, params[0] as string);
        return Promise.resolve((row as unknown as T) ?? null);
      }

      if (normalized.includes("from user_favorites")) {
        const [entityType, entityOrigin, entityId] = params as [FavoriteEntityType, ContentOrigin, string];
        const row = state.userFavorites.find(
          (entry) =>
            entry.entity_type === entityType &&
            entry.entity_origin === entityOrigin &&
            entry.entity_id === entityId,
        );
        return Promise.resolve((row as unknown as T) ?? null);
      }

      if (normalized.includes("from user_recent_items")) {
        if (normalized.includes("where entity_type = ? and entity_origin = ? and entity_id = ?")) {
          const [entityType, entityOrigin, entityId] = params as [RecentEntityType, ContentOrigin, string];
          const row = state.userRecentItems.find(
            (entry) =>
              entry.entity_type === entityType &&
              entry.entity_origin === entityOrigin &&
              entry.entity_id === entityId,
          );
          return Promise.resolve((row as unknown as T) ?? null);
        }

        if (normalized.includes("where 1 = 1") && normalized.includes("and entity_type = ?")) {
          const [entityType] = params as [RecentEntityType];
          const row = sortRecentRows(state.userRecentItems).find((entry) => entry.entity_type === entityType);
          return Promise.resolve((row as unknown as T) ?? null);
        }

        if (normalized.includes("where is_safe_to_resume = 1")) {
          const row = sortResumeRows(state.userResumeStates).find((entry) => entry.is_safe_to_resume === 1);
          return Promise.resolve((row as unknown as T) ?? null);
        }
      }

      if (normalized.includes("from user_resume_states")) {
        if (normalized.includes("resume_type = ?")) {
          const [resumeType, entityOrigin, entityId] = params as [ResumeType, ContentOrigin | null, string | null];
          const row = sortResumeRows(
            state.userResumeStates.filter(
              (entry) =>
                entry.resume_type === resumeType &&
                entry.entity_origin === entityOrigin &&
                entry.entity_id === entityId,
            ),
          )[0] ?? null;
          return Promise.resolve((row as unknown as T) ?? null);
        }

        if (normalized.includes("where is_safe_to_resume = 1")) {
          const row = sortResumeRows(state.userResumeStates.filter((entry) => entry.is_safe_to_resume === 1))[0] ?? null;
          return Promise.resolve((row as unknown as T) ?? null);
        }
      }

      return Promise.resolve(null);
    },
    getAllAsync<T = Readonly<Record<string, unknown>>>(source: string, ...params: readonly unknown[]): Promise<readonly T[]> {
      const normalized = normalizeSql(source);

      if (normalized.includes("from user_favorites")) {
        const filtered = filterByFavoriteParams(state.userFavorites, normalized, params);
        const ordered = sortByCreatedAtDesc(filtered);
        return Promise.resolve((sliceWithWindow(ordered, params) as unknown as readonly T[]));
      }

      if (normalized.includes("from user_recent_items")) {
        const filtered = filterByRecentParams(state.userRecentItems, normalized, params);
        const ordered = sortRecentRows(filtered);
        return Promise.resolve((sliceWithWindow(ordered, params) as unknown as readonly T[]));
      }

      if (normalized.includes("from user_resume_states")) {
        const filtered = filterByResumeParams(state.userResumeStates, normalized, params);
        const ordered = sortResumeRows(filtered);
        return Promise.resolve((sliceWithWindow(ordered, params) as unknown as readonly T[]));
      }

      return Promise.resolve([] as readonly T[]);
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
