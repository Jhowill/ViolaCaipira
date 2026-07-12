import type { SQLiteDatabaseLike } from "@/types/database";

export interface DatabaseTransactionOptions {
  readonly exclusive?: boolean;
}

export async function withDatabaseTransaction<T>(
  database: SQLiteDatabaseLike,
  task: (transactionalDatabase: SQLiteDatabaseLike) => Promise<T>,
  options: DatabaseTransactionOptions = {},
): Promise<T> {
  if (options.exclusive && database.withExclusiveTransactionAsync) {
    try {
      return await database.withExclusiveTransactionAsync(() => task(database));
    } catch (error) {
      const unsupportedOnWeb =
        error instanceof Error && error.message === "withExclusiveTransactionAsync is not supported on web";

      if (!unsupportedOnWeb) {
        throw error;
      }
    }
  }

  return database.withTransactionAsync(() => task(database));
}
