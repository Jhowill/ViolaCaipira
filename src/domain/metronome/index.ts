import type { MetronomeTapResetReason } from "@/types/metronome";

export const METRONOME_MIN_BPM = 20;
export const METRONOME_MAX_BPM = 400;
export const METRONOME_MIN_NUMERATOR = 1;
export const METRONOME_MAX_NUMERATOR = 32;
export const METRONOME_MIN_COUNT_IN_BARS = 0;
export const METRONOME_MAX_COUNT_IN_BARS = 32;
export const METRONOME_TAP_SAMPLE_LIMIT = 8;

function clamp(value: number, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.min(maximum, Math.max(minimum, Math.round(value)));
}

function median(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    const lower = sorted[middle - 1] ?? 0;
    const upper = sorted[middle] ?? lower;
    return (lower + upper) / 2;
  }

  return sorted[middle] ?? 0;
}

export function clampMetronomeBpm(
  bpm: number,
  minimum = METRONOME_MIN_BPM,
  maximum = METRONOME_MAX_BPM,
): number {
  return clamp(bpm, minimum, maximum);
}

export function clampMetronomeNumerator(numerator: number): number {
  return clamp(numerator, METRONOME_MIN_NUMERATOR, METRONOME_MAX_NUMERATOR);
}

export function clampCountInBars(countInBars: number): number {
  return clamp(countInBars, METRONOME_MIN_COUNT_IN_BARS, METRONOME_MAX_COUNT_IN_BARS);
}

export function calculateBeatIntervalMs(bpm: number): number {
  const safeBpm = Number.isFinite(bpm) && bpm > 0 ? bpm : METRONOME_MIN_BPM;
  return 60000 / safeBpm;
}

export function calculateBarDurationMs(
  bpm: number,
  numerator: number,
): number {
  return calculateBeatIntervalMs(bpm) * clampMetronomeNumerator(numerator);
}

export function calculateTapTempoBpm(
  tapTimestampsMs: readonly number[],
  minimumBpm = METRONOME_MIN_BPM,
  maximumBpm = METRONOME_MAX_BPM,
): number | null {
  if (tapTimestampsMs.length < 2) {
    return null;
  }

  const intervals = tapTimestampsMs
    .slice(1)
    .map((timestamp, index) => timestamp - tapTimestampsMs[index]!);

  if (intervals.length === 0) {
    return null;
  }

  const positiveIntervals = intervals.filter((interval) => Number.isFinite(interval) && interval > 0);
  if (positiveIntervals.length === 0) {
    return null;
  }

  const candidate = Math.round(60000 / median(positiveIntervals));
  return clampMetronomeBpm(candidate, minimumBpm, maximumBpm);
}

export function resetReasonForTapSequence(
  tapTimestampsMs: readonly number[],
  tapResetAfterMs: number,
  timestampMs: number,
): MetronomeTapResetReason {
  if (tapTimestampsMs.length === 0) {
    return "insufficient_samples";
  }

  const lastTapAtMs = tapTimestampsMs[tapTimestampsMs.length - 1] ?? null;
  if (lastTapAtMs === null) {
    return "insufficient_samples";
  }

  if (timestampMs - lastTapAtMs > tapResetAfterMs) {
    return "pause_long";
  }

  return "none";
}
