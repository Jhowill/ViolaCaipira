import { joinSqlStatements } from "@/database/schema/helpers";
import {
  SYSTEM_SCHEMA_STATEMENTS,
  SYSTEM_META_TABLE_SQL,
  SYSTEM_MIGRATIONS_TABLE_SQL,
  SYSTEM_CATALOG_RELEASES_TABLE_SQL,
  SYSTEM_INTEGRITY_EVENTS_TABLE_SQL,
} from "@/database/schema/system";
import { CATALOG_FOUNDATION_STATEMENTS } from "@/database/schema/catalog_foundation";
import { CATALOG_TUNINGS_STATEMENTS } from "@/database/schema/catalog_tunings";
import { CATALOG_CHORDS_STATEMENTS } from "@/database/schema/catalog_harmony";
import { CATALOG_RHYTHM_STATEMENTS } from "@/database/schema/catalog_rhythm";
import { CATALOG_SONG_STATEMENTS } from "@/database/schema/catalog_song";
import { CATALOG_EXERCISE_STATEMENTS } from "@/database/schema/catalog_exercise";
import { USER_STATEMENTS } from "@/database/schema/user";

export const INITIAL_SCHEMA_STATEMENTS = [
  ...SYSTEM_SCHEMA_STATEMENTS,
  ...CATALOG_FOUNDATION_STATEMENTS,
  ...CATALOG_TUNINGS_STATEMENTS,
  ...CATALOG_CHORDS_STATEMENTS,
  ...CATALOG_RHYTHM_STATEMENTS,
  ...CATALOG_SONG_STATEMENTS,
  ...CATALOG_EXERCISE_STATEMENTS,
  ...USER_STATEMENTS,
] as const;

export const INITIAL_SCHEMA_SQL = joinSqlStatements(INITIAL_SCHEMA_STATEMENTS);

export {
  SYSTEM_META_TABLE_SQL,
  SYSTEM_MIGRATIONS_TABLE_SQL,
  SYSTEM_CATALOG_RELEASES_TABLE_SQL,
  SYSTEM_INTEGRITY_EVENTS_TABLE_SQL,
};
