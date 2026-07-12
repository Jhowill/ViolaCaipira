import type { ContentOrigin, EntityRef, TuningDetails, VerificationStatus } from "@/types/music";

export type TuningRef = EntityRef<"tuning">;

export interface TuningSummary {
  readonly ref: TuningRef;
  readonly name: string;
  readonly shortName: string;
  readonly openChordLabel?: string | null;
  readonly courseLabels: readonly string[];
  readonly isActive: boolean;
  readonly isFavorite: boolean;
  readonly verificationStatus: VerificationStatus;
}

export interface TuningListOptions {
  readonly origin?: ContentOrigin | "all";
  readonly limit?: number;
}

export interface TuningRepository {
  getActive(): Promise<TuningDetails>;
  getByRef(ref: TuningRef): Promise<TuningDetails | null>;
  list(options?: TuningListOptions): Promise<readonly TuningSummary[]>;
  search(query: string): Promise<readonly TuningSummary[]>;
  activate(ref: TuningRef): Promise<TuningDetails>;
}

export function createTuningRef(origin: ContentOrigin, id: string): TuningRef {
  return {
    type: "tuning",
    origin,
    id,
  };
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}
