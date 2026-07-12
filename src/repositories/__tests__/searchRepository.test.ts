import { describe, expect, it } from "vitest";

import { createSearchRepository } from "@/repositories/searchRepository";
import { createRhythmRepository } from "@/repositories/rhythmRepository";
import { createSongRepository } from "@/repositories/songRepository";

import { createContentRepositoryFakeDatabase, createTuningRepositoryStub } from "./contentFixtures";

const NOW = "2026-07-12T15:00:00.000Z";

function createRepository() {
  const database = createContentRepositoryFakeDatabase();
  const songs = createSongRepository(database, {
    tuningRepository: createTuningRepositoryStub(),
    now: () => NOW,
  });
  const rhythms = createRhythmRepository(database, {
    now: () => NOW,
  });
  const repository = createSearchRepository({
    songs,
    rhythms,
  });

  return {
    database,
    repository,
  };
}

describe("search repository", () => {
  it("searches songs and rhythms together", async () => {
    const { repository } = createRepository();

    const results = await repository.search("cururu");

    expect(results.songs).toHaveLength(1);
    expect(results.songs[0]?.ref).toMatchObject({
      type: "song",
      origin: "catalog",
      id: "catalog-song-1",
    });
    expect(results.songs[0]?.rhythmLabel).toContain("Cururu");
    expect(results.rhythms).toHaveLength(1);
    expect(results.rhythms[0]?.ref).toMatchObject({
      type: "rhythm",
      origin: "catalog",
      id: "rhythm-cururu",
    });
    expect(results.rhythms[0]?.previewPattern?.ref).toMatchObject({
      type: "rhythm_pattern",
      origin: "catalog",
      id: "rhythm-cururu-pattern-1",
    });
  });

  it("delegates song and rhythm filters independently", async () => {
    const { repository } = createRepository();

    const songs = await repository.searchSongs("canto", {
      origin: "catalog",
      favorite: true,
    });
    const rhythms = await repository.searchRhythms("cururu", {
      timeSignatureNumerator: 4,
      timeSignatureDenominator: 4,
    });

    expect(songs).toHaveLength(1);
    expect(songs[0]).toMatchObject({
      ref: {
        type: "song",
        origin: "catalog",
        id: "catalog-song-1",
      },
      isFavorite: true,
    });
    expect(rhythms).toHaveLength(1);
    expect(rhythms[0]).toMatchObject({
      ref: {
        type: "rhythm",
        origin: "catalog",
        id: "rhythm-cururu",
      },
      isFavorite: true,
    });
  });
});
