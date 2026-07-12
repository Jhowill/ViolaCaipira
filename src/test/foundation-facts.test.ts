import { describe, expect, it } from "vitest";

import { foundationFacts } from "@/test/fixtures/foundation-facts";

describe("foundation facts", () => {
  it("keeps the base app identity aligned with the docs", () => {
    expect(foundationFacts).toMatchObject({
      appName: "Viola Caipira",
      runtime: "Expo + React Native",
      architecture: "offline-first",
    });
  });
});
