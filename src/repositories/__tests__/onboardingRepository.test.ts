import {
  createOnboardingRepository,
  DEFAULT_ONBOARDING_DRAFT,
} from "@/repositories/onboardingRepository";
import type { SQLiteDatabaseLike } from "@/types/database";
import { describe, expect, it } from "vitest";

interface ProfileRow {
  readonly id: "local_user";
  readonly experience_level: "beginner" | "intermediate" | "advanced";
  readonly onboarding_status: "not_started" | "in_progress" | "completed";
  readonly onboarding_step: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

function createOnboardingFakeDatabase() {
  let profile: ProfileRow | null = null;
  const meta = new Map<string, { readonly key: string; readonly value: string; readonly updatedAt: string }>();

  const database: SQLiteDatabaseLike = {
    execAsync: () => Promise.resolve(),
    runAsync: (source, ...params) => {
      const normalized = source.replace(/\s+/g, " ").toLowerCase();
      if (normalized.includes("insert into user_profile")) {
        profile = {
          id: "local_user",
          experience_level: params[1] as ProfileRow["experience_level"],
          onboarding_status: params[2] as ProfileRow["onboarding_status"],
          onboarding_step: params[3] as string | null,
          created_at: String(params[4]),
          updated_at: String(params[5]),
        };
      }
      if (normalized.includes("insert into system_meta")) {
        const key = String(params[0]);
        meta.set(key, { key, value: String(params[1]), updatedAt: String(params[2]) });
      }
      return Promise.resolve({ lastInsertRowId: 1, changes: 1 });
    },
    getFirstAsync: <T,>(source: string, ...params: readonly unknown[]) => {
      const normalized = source.replace(/\s+/g, " ").toLowerCase();
      if (normalized.includes("from user_profile")) {
        return Promise.resolve(profile as T | null);
      }
      if (normalized.includes("from system_meta")) {
        return Promise.resolve((meta.get(String(params[0])) ?? null) as T | null);
      }
      return Promise.resolve(null);
    },
    getAllAsync: <T,>() => Promise.resolve([] as readonly T[]),
    withTransactionAsync: <T,>(task: () => Promise<T>) => task(),
    withExclusiveTransactionAsync: <T,>(task: () => Promise<T>) => task(),
  };

  return { database, getProfile: () => profile, meta };
}

describe("onboarding repository", () => {
  it("cria o perfil local, salva escolhas progressivamente e conclui somente no final", async () => {
    const fake = createOnboardingFakeDatabase();
    const repository = createOnboardingRepository(fake.database);

    const initial = await repository.load();
    expect(initial.profile.onboardingStatus).toBe("not_started");
    expect(initial.draft).toEqual(DEFAULT_ONBOARDING_DRAFT);

    const inProgress = await repository.save(
      initial,
      { ...initial.draft, experienceLevel: "advanced", handedness: "left" },
      "tuning",
    );
    expect(inProgress.profile).toMatchObject({
      experienceLevel: "advanced",
      onboardingStatus: "in_progress",
      onboardingStep: "tuning",
    });

    const restored = await repository.load();
    expect(restored.draft).toMatchObject({ experienceLevel: "advanced", handedness: "left" });

    const completed = await repository.complete(restored);
    expect(completed.profile).toMatchObject({ onboardingStatus: "completed", onboardingStep: null });
    expect(fake.getProfile()?.onboarding_status).toBe("completed");
  });
});
