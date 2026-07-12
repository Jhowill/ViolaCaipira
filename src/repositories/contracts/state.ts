export type AsyncLoadStatus = "loading" | "ready" | "error";

export interface AsyncLoadingState {
  readonly status: "loading";
  readonly data: null;
  readonly error: null;
}

export interface AsyncReadyState<T> {
  readonly status: "ready";
  readonly data: T;
  readonly error: null;
}

export interface AsyncErrorState {
  readonly status: "error";
  readonly data: null;
  readonly error: Error;
}

export type AsyncState<T> = AsyncLoadingState | AsyncReadyState<T> | AsyncErrorState;

export function createLoadingState<T>(): AsyncState<T> {
  return {
    status: "loading",
    data: null,
    error: null,
  };
}

export function createReadyState<T>(data: T): AsyncState<T> {
  return {
    status: "ready",
    data,
    error: null,
  };
}

export function createErrorState<T>(error: Error): AsyncState<T> {
  return {
    status: "error",
    data: null,
    error,
  };
}

export function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(typeof error === "string" ? error : "Unexpected error.");
}
