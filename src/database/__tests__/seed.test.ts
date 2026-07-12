/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from "vitest";

import { MINIMAL_FIXTURE_SEED } from "@/database/seed/fixtures/minimal";
import { PRODUCTION_SEED_TEMPLATE } from "@/database/seed/production";
import { buildSeedManifest, validateSeedBundle } from "@/database/seed";
import { SeedValidationError } from "@/types/seed";

const now = () => "2026-07-12T12:00:00.000Z";

describe("seed pipeline", () => {
  it("produz um manifesto determinístico para a fixture mínima", async () => {
    const first = await buildSeedManifest(MINIMAL_FIXTURE_SEED, { now });
    const second = await buildSeedManifest(MINIMAL_FIXTURE_SEED, { now });

    expect(first.kind).toBe("fixtures");
    expect(first.itemCount).toBeGreaterThan(0);
    expect(first.payloadChecksum).toBe(second.payloadChecksum);
    expect(first.createdAt).toBe(now());
  });

  it("rejeita uma forma com menos de dez posições", async () => {
    const invalid = structuredClone(MINIMAL_FIXTURE_SEED) as any;
    invalid.chordShapePositions = invalid.chordShapePositions.slice(0, 9);

    await expect(validateSeedBundle(invalid, { now })).rejects.toBeInstanceOf(SeedValidationError);

    try {
      await validateSeedBundle(invalid, { now });
    } catch (error) {
      expect(error).toBeInstanceOf(SeedValidationError);
      const seedError = error as SeedValidationError;
      expect(seedError.issues.some((issue) => issue.path === "chordShapes[0].positions")).toBe(true);
    }
  });

  it("rejeita licença unknown quando o bundle é de produção", async () => {
    const invalid = structuredClone(PRODUCTION_SEED_TEMPLATE) as any;
    invalid.licenses = [
      {
        id: "license-unknown",
        name: "Licença desconhecida",
        code: null,
        licenseType: "unknown",
        attributionRequired: false,
        commercialUseAllowed: false,
        modificationAllowed: null,
        validFrom: null,
        validUntil: null,
        rightsHolder: null,
        attributionText: null,
        internalNotes: null,
      },
    ];

    await expect(validateSeedBundle(invalid, { now })).rejects.toBeInstanceOf(SeedValidationError);
  });

  it("falha claramente quando uma relação obrigatória aponta para um registro ausente", async () => {
    const invalid = structuredClone(MINIMAL_FIXTURE_SEED) as any;
    invalid.songSources = [
      {
        songId: "song-fixture",
        sourceId: "missing-source",
        licenseId: "license-fixture",
        attributionText: null,
      },
    ];

    try {
      await validateSeedBundle(invalid, { now });
      throw new Error("Expected validateSeedBundle to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(SeedValidationError);
      const seedError = error as SeedValidationError;
      expect(seedError.issues.some((issue) => issue.path === "songSources[0].sourceId")).toBe(true);
    }
  });
});
