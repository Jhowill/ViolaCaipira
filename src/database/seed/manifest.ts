import type { SeedBundleV1, SeedManifest } from "@/types/seed";

import { countSeedItems } from "@/database/mappers/seed";
import { sha256Hex, stableStringify } from "@/database/seed/helpers";

export async function buildSeedManifest(
  bundle: SeedBundleV1,
  options: {
    readonly now?: () => string;
  } = {},
): Promise<SeedManifest> {
  const payload = stableStringify(bundle);
  const payloadChecksum = await sha256Hex(payload);

  return {
    format: "cifras-de-viola-seed",
    formatVersion: 1,
    kind: bundle.kind,
    createdAt: options.now?.() ?? new Date().toISOString(),
    checksumAlgorithm: "sha256",
    payloadChecksum,
    itemCount: countSeedItems(bundle),
  };
}
