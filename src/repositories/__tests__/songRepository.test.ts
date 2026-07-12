import { describe, expect, it } from "vitest";

import { buildValidSongDocument } from "@/domain/music/__tests__/fixtures";
import { createSongRepository } from "@/repositories/songRepository";

import { createContentRepositoryFakeDatabase, createTuningRepositoryStub } from "./contentFixtures";

const NOW = "2026-07-12T15:00:00.000Z";
const LATER = "2026-07-12T16:00:00.000Z";

function createRepository() {
  const database = createContentRepositoryFakeDatabase();
  const repository = createSongRepository(database, {
    tuningRepository: createTuningRepositoryStub(),
    now: () => NOW,
  });

  return {
    database,
    repository,
  };
}

describe("song repository", () => {
  it("lists songs and loads song details with the expected key and preference state", async () => {
    const { repository } = createRepository();

    const list = await repository.list();

    expect(list.map((item) => item.ref.id)).toEqual(["catalog-song-1", "user-song-1"]);
    expect(list[0]).toMatchObject({
      origin: "catalog",
      isFavorite: true,
      keyLabel: "C maior",
      tuningLabel: "C",
    });
    expect(list[0]?.rhythmLabel).toContain("Cururu");
    expect(list[1]).toMatchObject({
      origin: "user",
      isFavorite: false,
      keyLabel: "D maior",
      tuningLabel: "Pessoal",
    });
    expect(list[1]?.rhythmLabel).toBe("Toada pessoal");

    const search = await repository.search("cururu");

    expect(search).toHaveLength(1);
    expect(search[0]?.ref.id).toBe("catalog-song-1");
    expect(search[0]?.rhythmLabel).toContain("Cururu");

    const catalog = await repository.getByRef({
      type: "song",
      origin: "catalog",
      id: "catalog-song-1",
    });

    expect(catalog).not.toBeNull();
    expect(catalog).toMatchObject({
      title: "Meu Canto",
      currentKeyPitchClass: 0,
      arrangementStatus: "verified",
      tuning: {
        type: "tuning",
        origin: "catalog",
        id: "catalog-tuning-c",
      },
    });
    expect(catalog?.rhythm?.name).toContain("Cururu");
    expect(catalog?.chordUsages[0]?.status).toBe("verified");

    const user = await repository.getByRef({
      type: "song",
      origin: "user",
      id: "user-song-1",
    });

    expect(user).not.toBeNull();
    expect(user).toMatchObject({
      title: "Meu Canto Caseiro",
      currentKeyPitchClass: 2,
      mode: "major",
      arrangementStatus: "symbols_only",
      tuning: {
        type: "tuning",
        origin: "user",
        id: "user-tuning-personal",
      },
    });
    expect(user?.document.sections[0]?.lines[0]?.segments[1]).toMatchObject({
      type: "chord",
      chord: {
        rootPitchClass: 2,
      },
    });
    expect(user?.rhythm?.name).toBe("Toada pessoal");
    expect(user?.chordUsages[0]?.preferredShape).toEqual({
      type: "chord_shape",
      origin: "catalog",
      id: "catalog-shape-c",
    });
  });

  it("saves user songs, rebuilds the chord index and records delete history", async () => {
    const { database, repository } = createRepository();

    const saved = await repository.saveUserSong({
      title: "Nova Cancao",
      artist: "Eu",
      composer: "Eu mesmo",
      copyrightConfirmation: "own_work",
      originalKeyPitchClass: 0,
      originalKeyMode: "major",
      tuning: {
        type: "tuning",
        origin: "catalog",
        id: "catalog-tuning-c",
      },
      rhythmId: "rhythm-cururu",
      customRhythmName: "Toada nova",
      bpm: 88,
      timeSignatureNumerator: 4,
      timeSignatureDenominator: 4,
      capoFret: 1,
      difficulty: "easy",
      document: buildValidSongDocument(),
      searchText: "Nova Cancao Eu",
      now: NOW,
    });

    expect(saved).toMatchObject({
      title: "Nova Cancao",
      tuningId: "catalog-tuning-c",
      rhythmId: "rhythm-cururu",
      difficulty: "easy",
      deletedAt: null,
    });

    const persisted = database.state.userSongs.find((row) => row.id === saved.id);
    expect(persisted).toMatchObject({
      title: "Nova Cancao",
      deleted_at: null,
    });
    expect(database.state.userSongVersions.filter((row) => row.song_id === saved.id)).toHaveLength(1);
    expect(database.state.userSongVersions[0]?.change_reason).toBe("import");
    expect(database.state.userSongChordIndex.filter((row) => row.song_id === saved.id)).toHaveLength(1);
    expect(database.state.userSongChordIndex.find((row) => row.song_id === saved.id)).toMatchObject({
      root_pitch_class: 0,
      quality_id: "major",
      occurrence_count: 1,
    });

    await repository.softDeleteUserSong(saved.id);

    const deleted = database.state.userSongs.find((row) => row.id === saved.id);
    expect(deleted?.deleted_at).toBe(NOW);
    const versions = database.state.userSongVersions.filter((row) => row.song_id === saved.id);
    expect(versions).toHaveLength(2);
    expect(versions[1]?.change_reason).toBe("before_delete");
    expect(await repository.getByRef({ type: "song", origin: "user", id: saved.id })).toBeNull();
  });

  it("saves, lists and discards song drafts", async () => {
    const { database, repository } = createRepository();

    const draft = await repository.saveUserSongDraft({
      draftType: "new",
      songId: "user-song-1",
      title: "Rascunho novo",
      formStateJson: JSON.stringify({ step: 2 }),
      documentFormatVersion: 1,
      documentJson: JSON.stringify(buildValidSongDocument()),
      now: LATER,
    });

    const drafts = await repository.listUserSongDrafts("user-song-1");

    expect(drafts[0]).toMatchObject({
      id: draft.id,
      recoveryStatus: "active",
    });
    expect(drafts).toHaveLength(2);

    await repository.discardUserSongDraft(draft.id);

    const discarded = await repository.listUserSongDrafts("user-song-1");

    expect(discarded[0]).toMatchObject({
      id: draft.id,
      recoveryStatus: "discarded",
    });
    expect(database.state.userSongDrafts.find((row) => row.id === draft.id)).toMatchObject({
      recovery_status: "discarded",
    });
  });
});
