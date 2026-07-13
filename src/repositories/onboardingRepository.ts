import { readSystemMeta, upsertSystemMeta } from "@/database/schema/system";
import { withDatabaseTransaction } from "@/database/transaction";
import type { SQLiteDatabaseLike } from "@/types/database";
import type { DiagramMode, Handedness, UserProfile } from "@/types/music";
import { UserProfileSchema } from "@/validation";

export type OnboardingStep =
  | "welcome"
  | "experience"
  | "tuning"
  | "diagram"
  | "handedness"
  | "microphone"
  | "summary";

export type OnboardingTuningChoice =
  | "cebolao-re"
  | "cebolao-mi"
  | "rio-abaixo"
  | "boiadeira"
  | "unknown";

export type OnboardingMicrophoneStatus =
  | "not_requested"
  | "granted"
  | "denied"
  | "blocked";

export interface OnboardingDraft {
  readonly experienceLevel: UserProfile["experienceLevel"];
  readonly tuningChoice: OnboardingTuningChoice;
  readonly diagramMode: DiagramMode;
  readonly handedness: Handedness;
  readonly microphoneStatus: OnboardingMicrophoneStatus;
}

export interface OnboardingSnapshot {
  readonly profile: UserProfile;
  readonly draft: OnboardingDraft;
}

interface UserProfileRow {
  readonly id: "local_user";
  readonly experience_level: UserProfile["experienceLevel"];
  readonly onboarding_status: UserProfile["onboardingStatus"];
  readonly onboarding_step: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

const DRAFT_META_KEY = "onboarding_draft_v1";

const SELECT_PROFILE_SQL = "SELECT * FROM user_profile WHERE id = 'local_user' LIMIT 1";
const UPSERT_PROFILE_SQL = `
INSERT INTO user_profile (
  id, experience_level, onboarding_status, onboarding_step, created_at, updated_at
) VALUES (?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  experience_level = excluded.experience_level,
  onboarding_status = excluded.onboarding_status,
  onboarding_step = excluded.onboarding_step,
  updated_at = excluded.updated_at
`.trim();

export const DEFAULT_ONBOARDING_DRAFT: OnboardingDraft = {
  experienceLevel: "beginner",
  tuningChoice: "cebolao-re",
  diagramMode: "five_courses",
  handedness: "right",
  microphoneStatus: "not_requested",
};

const validSteps = new Set<OnboardingStep>([
  "welcome",
  "experience",
  "tuning",
  "diagram",
  "handedness",
  "microphone",
  "summary",
]);
const validExperienceLevels = new Set<UserProfile["experienceLevel"]>([
  "beginner",
  "intermediate",
  "advanced",
]);
const validTuningChoices = new Set<OnboardingTuningChoice>([
  "cebolao-re",
  "cebolao-mi",
  "rio-abaixo",
  "boiadeira",
  "unknown",
]);
const validDiagramModes = new Set<DiagramMode>(["five_courses", "ten_strings"]);
const validHandedness = new Set<Handedness>(["right", "left"]);
const validMicrophoneStatuses = new Set<OnboardingMicrophoneStatus>([
  "not_requested",
  "granted",
  "denied",
  "blocked",
]);

function now(): string {
  return new Date().toISOString();
}

function mapProfile(row: UserProfileRow): UserProfile {
  return UserProfileSchema.parse({
    id: row.id,
    experienceLevel: row.experience_level,
    onboardingStatus: row.onboarding_status,
    onboardingStep: row.onboarding_step,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function parseStep(value: string | null): OnboardingStep {
  return value !== null && validSteps.has(value as OnboardingStep)
    ? (value as OnboardingStep)
    : "welcome";
}

function parseDraft(value: string | undefined): OnboardingDraft {
  if (!value) {
    return DEFAULT_ONBOARDING_DRAFT;
  }

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return {
      experienceLevel: validExperienceLevels.has(parsed["experienceLevel"] as UserProfile["experienceLevel"])
        ? (parsed["experienceLevel"] as UserProfile["experienceLevel"])
        : DEFAULT_ONBOARDING_DRAFT.experienceLevel,
      tuningChoice: validTuningChoices.has(parsed["tuningChoice"] as OnboardingTuningChoice)
        ? (parsed["tuningChoice"] as OnboardingTuningChoice)
        : DEFAULT_ONBOARDING_DRAFT.tuningChoice,
      diagramMode: validDiagramModes.has(parsed["diagramMode"] as DiagramMode)
        ? (parsed["diagramMode"] as DiagramMode)
        : DEFAULT_ONBOARDING_DRAFT.diagramMode,
      handedness: validHandedness.has(parsed["handedness"] as Handedness)
        ? (parsed["handedness"] as Handedness)
        : DEFAULT_ONBOARDING_DRAFT.handedness,
      microphoneStatus: validMicrophoneStatuses.has(parsed["microphoneStatus"] as OnboardingMicrophoneStatus)
        ? (parsed["microphoneStatus"] as OnboardingMicrophoneStatus)
        : DEFAULT_ONBOARDING_DRAFT.microphoneStatus,
    };
  } catch {
    return DEFAULT_ONBOARDING_DRAFT;
  }
}

async function writeProfile(
  database: SQLiteDatabaseLike,
  profile: UserProfile,
): Promise<void> {
  await database.runAsync(
    UPSERT_PROFILE_SQL,
    profile.id,
    profile.experienceLevel,
    profile.onboardingStatus,
    profile.onboardingStep,
    profile.createdAt,
    profile.updatedAt,
  );
}

export function createOnboardingRepository(database: SQLiteDatabaseLike) {
  const load = async (): Promise<OnboardingSnapshot> => {
    let row = await database.getFirstAsync<UserProfileRow>(SELECT_PROFILE_SQL);

    if (!row) {
      const timestamp = now();
      const profile: UserProfile = {
        id: "local_user",
        experienceLevel: DEFAULT_ONBOARDING_DRAFT.experienceLevel,
        onboardingStatus: "not_started",
        onboardingStep: "welcome",
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      await writeProfile(database, profile);
      row = await database.getFirstAsync<UserProfileRow>(SELECT_PROFILE_SQL);
    }

    if (!row) {
      throw new Error("Não foi possível inicializar o perfil local.");
    }

    const draftMeta = await readSystemMeta(database, DRAFT_META_KEY);
    return { profile: mapProfile(row), draft: parseDraft(draftMeta?.value) };
  };

  const save = async (
    current: OnboardingSnapshot,
    draft: OnboardingDraft,
    step: OnboardingStep,
  ): Promise<OnboardingSnapshot> => {
    const timestamp = now();
    const profile: UserProfile = {
      ...current.profile,
      experienceLevel: draft.experienceLevel,
      onboardingStatus: "in_progress",
      onboardingStep: step,
      updatedAt: timestamp,
    };

    await withDatabaseTransaction(database, async (transactionalDatabase) => {
      await writeProfile(transactionalDatabase, profile);
      await upsertSystemMeta(transactionalDatabase, DRAFT_META_KEY, JSON.stringify(draft), timestamp);
    });

    return { profile, draft };
  };

  const complete = async (current: OnboardingSnapshot): Promise<OnboardingSnapshot> => {
    const timestamp = now();
    const profile: UserProfile = {
      ...current.profile,
      experienceLevel: current.draft.experienceLevel,
      onboardingStatus: "completed",
      onboardingStep: null,
      updatedAt: timestamp,
    };

    await withDatabaseTransaction(database, async (transactionalDatabase) => {
      await writeProfile(transactionalDatabase, profile);
      await upsertSystemMeta(
        transactionalDatabase,
        DRAFT_META_KEY,
        JSON.stringify(current.draft),
        timestamp,
      );
    });

    return { profile, draft: current.draft };
  };

  return { load, save, complete, parseStep };
}
