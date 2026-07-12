import { describe, expect, it } from "vitest";

import { createRhythmRepository } from "@/repositories/rhythmRepository";

import { createContentRepositoryFakeDatabase } from "./contentFixtures";

const NOW = "2026-07-12T15:00:00.000Z";

function createRepository() {
  const database = createContentRepositoryFakeDatabase();
  const repository = createRhythmRepository(database, {
    now: () => NOW,
  });

  return {
    database,
    repository,
  };
}

describe("rhythm repository", () => {
  it("lists rhythms with preview patterns and favorite state", async () => {
    const { repository } = createRepository();

    const list = await repository.list();

    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      ref: {
        type: "rhythm",
        origin: "catalog",
        id: "rhythm-cururu",
      },
      isFavorite: true,
      timeSignatureLabel: "4/4",
      originRegion: "SP",
    });
    expect(list[0]?.previewPattern).toMatchObject({
      ref: {
        type: "rhythm_pattern",
        origin: "catalog",
        id: "rhythm-cururu-pattern-1",
      },
      steps: [
        {
          id: "rhythm-cururu-step-1",
          label: "Batida forte",
        },
        {
          id: "rhythm-cururu-step-2",
          label: "Resposta",
        },
      ],
    });
    expect(list[0]?.previewPattern?.audio).toHaveLength(1);
  });

  it("searches and expands the full rhythm detail", async () => {
    const { repository } = createRepository();

    const search = await repository.search("cururu", {
      timeSignatureNumerator: 4,
      timeSignatureDenominator: 4,
    });

    expect(search).toHaveLength(1);
    expect(search[0]).toMatchObject({
      ref: {
        type: "rhythm",
        origin: "catalog",
        id: "rhythm-cururu",
      },
      isFavorite: true,
    });

    const detail = await repository.getByRef({
      type: "rhythm",
      origin: "catalog",
      id: "rhythm-cururu",
    });

    expect(detail).not.toBeNull();
    expect(detail).toMatchObject({
      ref: {
        type: "rhythm",
        origin: "catalog",
        id: "rhythm-cururu",
      },
      description: "Ritmo para acompanhar cantos.",
      minPracticeBpm: 72,
      maxRecommendedBpm: 112,
      pulsesPerQuarter: 120,
    });
    expect(detail?.patterns).toHaveLength(1);
    expect(detail?.patterns[0]).toMatchObject({
      ref: {
        type: "rhythm_pattern",
        origin: "catalog",
        id: "rhythm-cururu-pattern-1",
      },
      steps: [
        {
          id: "rhythm-cururu-step-1",
        },
        {
          id: "rhythm-cururu-step-2",
        },
      ],
      audio: [
        {
          assetId: "asset-rhythm-cururu",
        },
      ],
    });
    expect(detail?.exercises).toHaveLength(1);
    expect(detail?.exercises[0]).toMatchObject({
      ref: {
        type: "exercise",
        origin: "catalog",
        id: "exercise-cururu-1",
      },
      title: "Cururu em 4 tempos",
      difficulty: "beginner",
    });
    expect(detail?.audio).toHaveLength(1);
  });
});
