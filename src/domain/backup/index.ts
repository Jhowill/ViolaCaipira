import type { JsonObject } from "@/types/music";

export const BACKUP_SECTION_ORDER = [
  "profile",
  "preferences",
  "songs",
  "songVersions",
  "songNotes",
  "tunings",
  "tuningCourses",
  "tuningStrings",
  "chordShapes",
  "favorites",
  "recentItems",
  "practiceSessions",
  "tuningSessions",
  "songPreferences",
] as const;

export type BackupSectionName = (typeof BACKUP_SECTION_ORDER)[number];

export const DEFAULT_BACKUP_MAX_BYTES = 50 * 1024 * 1024;

export function cloneJsonObject<T extends JsonObject>(value: T): T {
  return structuredClone(value);
}

export function toByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  const view = new Uint8Array(digest);
  let hex = "";

  for (const byte of view) {
    hex += byte.toString(16).padStart(2, "0");
  }

  return hex;
}

export function countJsonObjects(value: readonly JsonObject[] | JsonObject | null | undefined): number {
  if (Array.isArray(value)) {
    return value.length;
  }

  if (value === null || value === undefined) {
    return 0;
  }

  return Object.keys(value).length > 0 ? 1 : 0;
}
