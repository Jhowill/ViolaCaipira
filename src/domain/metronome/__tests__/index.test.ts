import { describe, expect, it } from "vitest";

import {
  calculateBeatIntervalMs,
  calculateTapTempoBpm,
  clampCountInBars,
  clampMetronomeBpm,
  clampMetronomeNumerator,
  resetReasonForTapSequence,
} from "@/domain/metronome";

describe("metronome domain", () => {
  it("clampa BPM, numerador e contagem inicial aos limites definidos", () => {
    expect(clampMetronomeBpm(10)).toBe(20);
    expect(clampMetronomeBpm(420)).toBe(400);
    expect(clampMetronomeNumerator(0)).toBe(1);
    expect(clampMetronomeNumerator(99)).toBe(32);
    expect(clampCountInBars(-1)).toBe(0);
    expect(clampCountInBars(99)).toBe(32);
  });

  it("calcula o intervalo da batida e o BPM do tap tempo pela mediana", () => {
    expect(calculateBeatIntervalMs(120)).toBe(500);
    expect(calculateTapTempoBpm([0, 500, 1100, 1600])).toBe(120);
    expect(calculateTapTempoBpm([0])).toBeNull();
  });

  it("reinicia o tap tempo após pausa longa", () => {
    expect(resetReasonForTapSequence([], 2000, 3000)).toBe("insufficient_samples");
    expect(resetReasonForTapSequence([1000, 1500], 2000, 3800)).toBe("pause_long");
    expect(resetReasonForTapSequence([1000, 1500], 2000, 2800)).toBe("none");
  });
});

