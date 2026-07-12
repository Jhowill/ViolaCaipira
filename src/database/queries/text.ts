export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function splitSearchTerms(value: string): readonly string[] {
  const normalized = normalizeSearchText(value);

  if (normalized.length === 0) {
    return [];
  }

  return normalized.split(" ").filter((term) => term.length > 0);
}

export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export function buildContainsLikePattern(value: string): string {
  const normalized = normalizeSearchText(value);

  if (normalized.length === 0) {
    return "%";
  }

  return `%${escapeLikePattern(normalized)}%`;
}

export function buildPrefixLikePattern(value: string): string {
  const normalized = normalizeSearchText(value);

  if (normalized.length === 0) {
    return "%";
  }

  return `${escapeLikePattern(normalized)}%`;
}

