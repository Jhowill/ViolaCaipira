import { describe, expect, it, vi } from "vitest";

import { withDatabaseTransaction } from "@/database/transaction";
import type { SQLiteDatabaseLike } from "@/types/database";

function createDatabase(): SQLiteDatabaseLike {
  return {
    execAsync: () => Promise.resolve(),
    runAsync: () => Promise.resolve({ lastInsertRowId: 0, changes: 0 }),
    getFirstAsync: () => Promise.resolve(null),
    getAllAsync: () => Promise.resolve([]),
    withTransactionAsync: async (task) => task(),
    withExclusiveTransactionAsync: () =>
      Promise.reject(new Error("withExclusiveTransactionAsync is not supported on web")),
  };
}

describe("withDatabaseTransaction", () => {
  it("usa transação comum quando a exclusiva não existe no web", async () => {
    const database = createDatabase();
    const task = vi.fn(() => Promise.resolve("ok"));

    await expect(withDatabaseTransaction(database, task, { exclusive: true })).resolves.toBe("ok");
    expect(task).toHaveBeenCalledOnce();
  });
});
