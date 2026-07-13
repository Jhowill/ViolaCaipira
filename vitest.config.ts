import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "src"),
      "react-native": path.resolve(projectRoot, "src/components/ui/__tests__/stubs/react-native.tsx"),
      "react-native-safe-area-context": path.resolve(
        projectRoot,
        "src/components/ui/__tests__/stubs/react-native-safe-area-context.tsx",
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
