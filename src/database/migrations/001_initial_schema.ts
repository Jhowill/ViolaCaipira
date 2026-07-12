import type { MigrationDefinition } from "@/types/database";

import { INITIAL_SCHEMA_STATEMENTS } from "@/database/schema";

export const INITIAL_SCHEMA_MIGRATION: MigrationDefinition = {
  version: 1,
  name: "initial schema",
  checksum: "001-initial-schema-v1",
  up: async (database) => {
    for (const statement of INITIAL_SCHEMA_STATEMENTS) {
      await database.execAsync(statement);
    }
  },
};
