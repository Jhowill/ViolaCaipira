export interface PaginationWindow {
  readonly limit: number;
  readonly offset: number;
}

export function normalizeLimit(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  const normalized = Math.floor(value);

  if (normalized < 1) {
    return fallback;
  }

  return normalized;
}

export function normalizeOffset(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) {
    return 0;
  }

  const normalized = Math.floor(value);
  return normalized < 0 ? 0 : normalized;
}

export function buildPaginationWindow(options: {
  readonly limit?: number;
  readonly offset?: number;
  readonly fallbackLimit: number;
}): PaginationWindow {
  return {
    limit: normalizeLimit(options.limit, options.fallbackLimit),
    offset: normalizeOffset(options.offset),
  };
}

