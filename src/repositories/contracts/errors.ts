export type RepositoryErrorCode =
  | "DATABASE_ERROR"
  | "INVALID_TUNING_REFERENCE"
  | "PREFERENCES_NOT_FOUND"
  | "TUNING_NOT_FOUND";

export class RepositoryError extends Error {
  public readonly code: RepositoryErrorCode;
  public override readonly cause?: unknown;

  constructor(
    code: RepositoryErrorCode,
    message: string,
    cause?: unknown,
  ) {
    super(message);
    this.name = "RepositoryError";
    this.code = code;
    this.cause = cause;
  }
}

export function toRepositoryError(error: unknown, code: RepositoryErrorCode, message: string): RepositoryError {
  if (error instanceof RepositoryError) {
    return error;
  }

  return new RepositoryError(code, message, error);
}
