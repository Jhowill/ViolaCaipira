import { describe, expect, it } from "vitest";

import { createPreferencesRepository } from "@/repositories/preferencesRepository";
import { RepositoryError } from "@/repositories/contracts";
import { createTuningRepository } from "@/repositories/tuningRepository";
import { createRepositoryFakeDatabase } from "@/repositories/__tests__/helpers";
import type { EntityRef } from "@/types/music";

const now = () => "2026-07-12T12:00:00.000Z";

const catalogRef: EntityRef<"tuning"> = {
  type: "tuning",
  origin: "catalog",
  id: "catalog-tuning-c",
};

const userRef: EntityRef<"tuning"> = {
  type: "tuning",
  origin: "user",
  id: "user-tuning-personal",
};

describe("preferences repository", () => {
  it("carrega preferências e persiste a troca de afinação", async () => {
    const database = createRepositoryFakeDatabase();
    const repository = createPreferencesRepository(database, { now });

    const preferences = await repository.get();

    expect(preferences.app.activeTuningOrigin).toBe("catalog");
    expect(preferences.app.activeTuningId).toBe("catalog-tuning-c");

    const updated = await repository.setActiveTuning(userRef);

    expect(updated.app.activeTuningOrigin).toBe("user");
    expect(updated.app.activeTuningId).toBe("user-tuning-personal");
    expect(database.state.userAppPreferences?.active_tuning_id).toBe("user-tuning-personal");
  });

  it("restaura apenas a seção solicitada", async () => {
    const database = createRepositoryFakeDatabase();
    const repository = createPreferencesRepository(database, { now });
    const preferences = await repository.get();

    await repository.save({
      ...preferences,
      appearance: {
        ...preferences.appearance,
        themeMode: "dark",
        updatedAt: now(),
      },
    });

    const restored = await repository.restore("appearance");

    expect(restored.appearance.themeMode).toBe("system");
    expect(restored.app.activeTuningId).toBe("catalog-tuning-c");
  });

  it("rejeita afinação inexistente ao salvar", async () => {
    const database = createRepositoryFakeDatabase();
    const repository = createPreferencesRepository(database, { now });
    const preferences = await repository.get();

    try {
      await repository.save({
        ...preferences,
        app: {
          ...preferences.app,
          activeTuningOrigin: "user",
          activeTuningId: "missing-tuning",
          updatedAt: now(),
        },
      });
      throw new Error("Expected repository.save to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(RepositoryError);
      expect(error).toMatchObject({
        code: "INVALID_TUNING_REFERENCE",
      });
    }
  });
});

describe("tuning repository", () => {
  it("permite listar um catálogo vazio antes de existirem preferências", async () => {
    const database = createRepositoryFakeDatabase({
      catalogTunings: [],
      catalogTuningAliases: [],
      catalogTuningCourses: [],
      catalogTuningStrings: [],
      userTunings: [],
      userTuningCourses: [],
      userTuningStrings: [],
    });
    const unavailablePreferences = {
      get: () => Promise.reject(new RepositoryError("TUNING_NOT_FOUND", "No tuning is available.")),
      save: () => Promise.reject(new Error("not used")),
      restore: () => Promise.reject(new Error("not used")),
      setActiveTuning: () => Promise.reject(new Error("not used")),
    };
    const repository = createTuningRepository(database, {
      preferencesRepository: unavailablePreferences,
    });

    await expect(repository.list()).resolves.toEqual([]);
  });

  it("lista e busca afinações com marcadores de ativo e favorito", async () => {
    const database = createRepositoryFakeDatabase();
    const preferencesRepository = createPreferencesRepository(database, { now });
    const repository = createTuningRepository(database, { preferencesRepository });

    const list = await repository.list();

    expect(list).toHaveLength(2);
    expect(list[0]?.ref).toEqual(catalogRef);
    expect(list[0]?.isActive).toBe(true);
    expect(list[1]?.ref).toEqual(userRef);
    expect(list[1]?.isFavorite).toBe(true);

    const search = await repository.search("cebolao");
    expect(search.map((item) => item.ref.id)).toContain("catalog-tuning-c");

    const user = await repository.getByRef(userRef);
    expect(user?.origin).toBe("user");
    expect(user?.shortName).toBe("Afinação pessoal");
  });

  it("ativa a afinação escolhida e reflete no active tuning", async () => {
    const database = createRepositoryFakeDatabase();
    const preferencesRepository = createPreferencesRepository(database, { now });
    const repository = createTuningRepository(database, { preferencesRepository });

    const activated = await repository.activate(userRef);

    expect(activated.origin).toBe("user");
    expect((await preferencesRepository.get()).app.activeTuningId).toBe("user-tuning-personal");
    expect((await repository.getActive()).id).toBe("user-tuning-personal");
  });

  it("rejeita ativação de afinação inexistente", async () => {
    const database = createRepositoryFakeDatabase();
    const preferencesRepository = createPreferencesRepository(database, { now });
    const repository = createTuningRepository(database, { preferencesRepository });

    try {
      await repository.activate({
        type: "tuning",
        origin: "user",
        id: "missing-tuning",
      });
      throw new Error("Expected repository.activate to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(RepositoryError);
      expect(error).toMatchObject({
        code: "INVALID_TUNING_REFERENCE",
      });
    }
  });
});
