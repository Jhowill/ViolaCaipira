import { useCallback, useEffect, useRef, useState } from "react";

import { getAppDatabaseClient } from "@/database/client";
import { createFavoritesRepository, type FavoriteFilters, type FavoriteRecord, type FavoriteRef, type FavoritesRepository } from "@/repositories/favoritesRepository";
import { RepositoryError, createErrorState, createLoadingState, createReadyState, normalizeError } from "@/repositories/contracts";

export interface UseFavoritesResult {
  readonly status: "loading" | "ready" | "error";
  readonly favorites: readonly FavoriteRecord[];
  readonly filters: FavoriteFilters;
  readonly setFilters: (filters: FavoriteFilters) => void;
  readonly error: Error | null;
  readonly refresh: () => Promise<readonly FavoriteRecord[]>;
  readonly isFavorite: (ref: FavoriteRef) => boolean;
  readonly setFavorite: (ref: FavoriteRef, favorite: boolean) => Promise<boolean>;
  readonly toggleFavorite: (ref: FavoriteRef) => Promise<boolean>;
  readonly cleanup: () => Promise<number>;
}

interface FavoritesStateData {
  readonly favorites: readonly FavoriteRecord[];
}

let defaultFavoritesRepositoryPromise: Promise<FavoritesRepository> | null = null;

async function getDefaultFavoritesRepository(): Promise<FavoritesRepository> {
  if (!defaultFavoritesRepositoryPromise) {
    defaultFavoritesRepositoryPromise = (async () => {
      const client = await getAppDatabaseClient();
      return createFavoritesRepository(client.database);
    })().catch((error: unknown) => {
      defaultFavoritesRepositoryPromise = null;
      throw error;
    });
  }

  return defaultFavoritesRepositoryPromise;
}

export async function resolveFavoritesRepository(repository?: FavoritesRepository): Promise<FavoritesRepository> {
  if (repository) {
    return repository;
  }

  return getDefaultFavoritesRepository();
}

function favoriteKey(ref: FavoriteRef): string {
  return `${ref.type}:${ref.origin}:${ref.id}`;
}

function sameFavorite(left: FavoriteRecord, right: FavoriteRef): boolean {
  return favoriteKey(left.ref) === favoriteKey(right);
}

function updateFavoritesList(
  favorites: readonly FavoriteRecord[],
  ref: FavoriteRef,
  favorite: boolean,
): readonly FavoriteRecord[] {
  const filtered = favorites.filter((item) => !sameFavorite(item, ref));

  if (!favorite) {
    return filtered;
  }

  return [
    {
      ref,
      createdAt: new Date().toISOString(),
    },
    ...filtered,
  ];
}

export function useFavorites(options: {
  readonly repository?: FavoritesRepository;
  readonly initialFilters?: FavoriteFilters;
} = {}): UseFavoritesResult {
  const repositoryRef = useRef<FavoritesRepository | undefined>(options.repository);
  repositoryRef.current = options.repository;
  const [filters, setFilters] = useState<FavoriteFilters>(options.initialFilters ?? {});
  const [state, setState] = useState(createLoadingState<FavoritesStateData>());
  const favoritesRef = useRef<readonly FavoriteRecord[]>([]);

  const replaceFavorites = useCallback((favorites: readonly FavoriteRecord[]): void => {
    favoritesRef.current = favorites;
    setState(
      createReadyState<FavoritesStateData>({
        favorites,
      }),
    );
  }, []);

  const refresh = useCallback(async (): Promise<readonly FavoriteRecord[]> => {
    try {
      setState(createLoadingState<FavoritesStateData>());
      const repository = await resolveFavoritesRepository(repositoryRef.current);
      const next = await repository.list(filters);
      replaceFavorites(next);
      return next;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<FavoritesStateData>(normalized));
      throw normalized;
    }
  }, [filters, replaceFavorites]);

  const setFavorite = useCallback(async (ref: FavoriteRef, favorite: boolean): Promise<boolean> => {
    const previousFavorites = favoritesRef.current;
    const nextFavorites = updateFavoritesList(previousFavorites, ref, favorite);
    replaceFavorites(nextFavorites);

    try {
      const repository = await resolveFavoritesRepository(repositoryRef.current);
      const updated = await repository.setFavorite(ref, favorite);

      if (favorite && !updated) {
        throw new RepositoryError("DATABASE_ERROR", "Unable to favorite a missing item.");
      }

      return updated;
    } catch (error) {
      favoritesRef.current = previousFavorites;
      const normalized = normalizeError(error);
      setState(createErrorState<FavoritesStateData>(normalized));
      throw normalized;
    }
  }, [replaceFavorites]);

  const toggleFavorite = useCallback(async (ref: FavoriteRef): Promise<boolean> => {
    const next = !favoritesRef.current.some((favorite) => sameFavorite(favorite, ref));
    return setFavorite(ref, next);
  }, [setFavorite]);

  const cleanup = useCallback(async (): Promise<number> => {
    const repository = await resolveFavoritesRepository(repositoryRef.current);
    const removed = await repository.cleanup();
    await refresh();
    return removed;
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;

    void refresh().catch((error) => {
      if (cancelled) {
        return;
      }

      const normalized = normalizeError(error);
      setState(createErrorState<FavoritesStateData>(normalized));
    });

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return {
    status: state.status,
    favorites: favoritesRef.current,
    filters,
    setFilters,
    error: state.error,
    refresh,
    isFavorite: (ref) => favoritesRef.current.some((favorite) => sameFavorite(favorite, ref)),
    setFavorite,
    toggleFavorite,
    cleanup,
  };
}
