import type { MigrationDefinition } from "@/types/database";

import { runMigrations, sortMigrations } from "@/database/migrations/runner";
import { INITIAL_SCHEMA_MIGRATION } from "@/database/migrations/001_initial_schema";

export const DEFAULT_MIGRATIONS: readonly MigrationDefinition[] = [INITIAL_SCHEMA_MIGRATION];

export { runMigrations, sortMigrations };
export type { MigrationDefinition } from "@/types/database";
