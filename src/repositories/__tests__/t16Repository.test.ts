import { describe, expect, it } from "vitest";

import { createFavoritesRepository } from "@/repositories/favoritesRepository";
import { createRecentRepository } from "@/repositories/recentRepository";
import { createResumeRepository } from "@/repositories/resumeRepository";

import { buildT16DatabaseState, createT16Database, type T16RecentRow, type T16ResumeRow } from "./t16Database";

const NOW = "2026-07-12T15:00:00.000Z";
const LATER = "2026-07-12T16:00:00.000Z";
const FUTURE = "2026-07-13T00:00:00.000Z";
const PAST = "2026-07-11T00:00:00.000Z";

function buildRecentRows(count: number): T16RecentRow[] {
  return Array.from({ length: count }, (_, index) => {
    const suffix = String(index + 1).padStart(2, "0");

    return {
      id: `recent-rhythm-${suffix}`,
      entity_type: "rhythm",
      entity_origin: "catalog",
      entity_id: `catalog-rhythm-${index + 1}`,
      opened_at: `2026-07-12T10:${suffix}:00.000Z`,
      open_count: 1,
      context_json: null,
    };
  });
}

function buildResumeRows(): T16ResumeRow[] {
  return [
    {
      id: "resume-valid",
      resume_type: "song",
      entity_origin: "catalog",
      entity_id: "catalog-song-1",
      state_json: JSON.stringify({ position: 120, keyPitchClass: 4 }),
      is_safe_to_resume: 1,
      created_at: NOW,
      updated_at: NOW,
      expires_at: FUTURE,
    },
    {
      id: "resume-expired",
      resume_type: "song",
      entity_origin: "catalog",
      entity_id: "catalog-song-2",
      state_json: JSON.stringify({ position: 8 }),
      is_safe_to_resume: 1,
      created_at: NOW,
      updated_at: NOW,
      expires_at: PAST,
    },
    {
      id: "resume-unsafe",
      resume_type: "tuner_session",
      entity_origin: "user",
      entity_id: "session-1",
      state_json: JSON.stringify({ micActive: true }),
      is_safe_to_resume: 0,
      created_at: NOW,
      updated_at: NOW,
      expires_at: null,
    },
    {
      id: "resume-orphan",
      resume_type: "song",
      entity_origin: "catalog",
      entity_id: "missing-song",
      state_json: JSON.stringify({ position: 12 }),
      is_safe_to_resume: 1,
      created_at: NOW,
      updated_at: NOW,
      expires_at: null,
    },
    {
      id: "resume-invalid-json",
      resume_type: "draft",
      entity_origin: "user",
      entity_id: "draft-1",
      state_json: "{invalid-json",
      is_safe_to_resume: 1,
      created_at: NOW,
      updated_at: NOW,
      expires_at: null,
    },
  ];
}

describe("favorites repository", () => {
  it("avoids duplicate favorites and ignores missing references", async () => {
    const database = createT16Database();
    const repository = createFavoritesRepository(database, {
      now: () => NOW,
      idFactory: () => "favorite-1",
    });

    const ref = {
      type: "song" as const,
      origin: "catalog" as const,
      id: "catalog-song-1",
    };

    expect(await repository.setFavorite(ref, true)).toBe(true);
    expect(await repository.setFavorite(ref, true)).toBe(true);
    expect(database.state.userFavorites).toHaveLength(1);
    expect(await repository.isFavorite(ref)).toBe(true);

    const missingRef = {
      type: "song" as const,
      origin: "catalog" as const,
      id: "missing-song",
    };

    expect(await repository.setFavorite(missingRef, true)).toBe(false);
    expect(database.state.userFavorites).toHaveLength(1);

    const favorites = await repository.list();
    expect(favorites).toHaveLength(1);
    expect(favorites[0]).toMatchObject({
      ref,
      createdAt: NOW,
    });
  });

  it("cleans orphan favorites", async () => {
    const database = createT16Database(
      buildT16DatabaseState({
        userFavorites: [
          {
            id: "favorite-orphan",
            entity_type: "song",
            entity_origin: "catalog",
            entity_id: "missing-song",
            created_at: NOW,
          },
          {
            id: "favorite-valid",
            entity_type: "song",
            entity_origin: "catalog",
            entity_id: "catalog-song-1",
            created_at: LATER,
          },
        ],
      }),
    );
    const repository = createFavoritesRepository(database, { now: () => NOW });

    expect(await repository.cleanup()).toBe(1);

    const favorites = await repository.list();
    expect(favorites).toHaveLength(1);
    expect(favorites[0]?.ref.id).toBe("catalog-song-1");
    expect(database.state.userFavorites).toHaveLength(1);
  });
});

describe("recent repository", () => {
  it("deduplicates recents and increments open count", async () => {
    const database = createT16Database();
    const repository = createRecentRepository(database, {
      now: () => NOW,
      idFactory: () => "recent-1",
    });

    const ref = {
      type: "song" as const,
      origin: "catalog" as const,
      id: "catalog-song-1",
    };
    const firstContext = {
      position: 44,
      section: "chorus",
    } as const;

    const first = await repository.recordOpen(ref, firstContext);
    const second = await repository.recordOpen(ref, null);
    const recents = await repository.list();

    expect(first).toMatchObject({
      ref,
      openedAt: NOW,
      openCount: 1,
      context: firstContext,
    });
    expect(second).toMatchObject({
      ref,
      openedAt: NOW,
      openCount: 2,
      context: firstContext,
    });
    expect(recents).toHaveLength(1);
    expect(recents[0]).toMatchObject({
      ref,
      openCount: 2,
      context: firstContext,
    });
  });

  it("cleans orphan recents and prunes type limits", async () => {
    const rhythmRows = buildRecentRows(21);
    const database = createT16Database(
      buildT16DatabaseState({
        catalogRhythms: Array.from({ length: 21 }, (_, index) => ({
          id: `catalog-rhythm-${index + 1}`,
        })),
        userRecentItems: [
          ...rhythmRows,
          {
            id: "recent-orphan",
            entity_type: "song",
            entity_origin: "catalog",
            entity_id: "missing-song",
            opened_at: "2026-07-12T11:00:00.000Z",
            open_count: 1,
            context_json: null,
          },
        ],
      }),
    );
    const repository = createRecentRepository(database, { now: () => NOW });

    expect(await repository.cleanup()).toBe(2);

    const recents = await repository.list({
      entityType: "rhythm",
      limit: 50,
    });

    expect(recents).toHaveLength(20);
    expect(recents.some((item) => item.ref.id === "catalog-rhythm-1")).toBe(false);
    expect(recents.some((item) => item.ref.id === "catalog-rhythm-21")).toBe(true);
    expect(database.state.userRecentItems).toHaveLength(20);
  });
});

describe("resume repository", () => {
  it("saves and reloads a safe song resume state", async () => {
    const database = createT16Database();
    const repository = createResumeRepository(database, {
      now: () => NOW,
      idFactory: () => "resume-1",
    });

    const target = {
      resumeType: "song" as const,
      entityOrigin: "catalog" as const,
      entityId: "catalog-song-1",
    };
    const state = {
      position: 120,
      keyPitchClass: 4,
    } as const;

    const saved = await repository.save({
      ...target,
      state,
      isSafeToResume: true,
      expiresAt: FUTURE,
    });

    expect(saved).toMatchObject({
      id: "resume-1",
      ...target,
      state,
      stateJson: JSON.stringify(state),
      isSafeToResume: true,
      createdAt: NOW,
      updatedAt: NOW,
      expiresAt: FUTURE,
    });

    expect(await repository.getByTarget(target)).toMatchObject({
      id: "resume-1",
      ...target,
      state,
      isSafeToResume: true,
    });
    expect(await repository.getLatestSafe()).toMatchObject({
      id: "resume-1",
      ...target,
      state,
      isSafeToResume: true,
    });
  });

  it("removes unsafe, expired, orphan and invalid resume states during cleanup", async () => {
    const database = createT16Database(
      buildT16DatabaseState({
        catalogSongs: [
          {
            id: "catalog-song-1",
          },
          {
            id: "catalog-song-2",
          },
        ],
        userResumeStates: buildResumeRows(),
      }),
    );
    const repository = createResumeRepository(database, { now: () => NOW });

    expect(await repository.cleanup()).toBe(4);

    const states = await repository.list({ safeOnly: false });
    expect(states).toHaveLength(1);
    expect(states[0]).toMatchObject({
      id: "resume-valid",
      resumeType: "song",
      entityOrigin: "catalog",
      entityId: "catalog-song-1",
      isSafeToResume: true,
      state: {
        position: 120,
        keyPitchClass: 4,
      },
    });
    expect(database.state.userResumeStates).toHaveLength(1);
  });

  it("refuses unsafe resume states and clears the stored state", async () => {
    const database = createT16Database();
    const repository = createResumeRepository(database, {
      now: () => NOW,
      idFactory: () => "resume-2",
    });

    const target = {
      resumeType: "song" as const,
      entityOrigin: "catalog" as const,
      entityId: "catalog-song-1",
    };

    await repository.save({
      ...target,
      state: {
        position: 88,
      },
      isSafeToResume: true,
    });

    expect(
      await repository.save({
        ...target,
        state: {
          position: 0,
          micActive: true,
        },
        isSafeToResume: false,
      }),
    ).toBeNull();

    expect(await repository.getByTarget(target)).toBeNull();
    expect(database.state.userResumeStates).toHaveLength(0);
  });
});
