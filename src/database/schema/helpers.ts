export function quoteSqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

export function quoteSqlValues(values: readonly string[]): string {
  return values.map((value) => quoteSqlString(value)).join(", ");
}

export function joinSqlStatements(statements: readonly string[]): string {
  return statements.join("\n\n");
}
