import type { RhythmFilters, RhythmRepository, RhythmSummary } from "@/repositories/rhythmRepository";
import type { SongFilters, SongRepository, SongSummary } from "@/repositories/songRepository";

export interface SearchRepositoryOptions {
  readonly songFilters?: SongFilters;
  readonly rhythmFilters?: RhythmFilters;
}

export interface SearchResults {
  readonly songs: readonly SongSummary[];
  readonly rhythms: readonly RhythmSummary[];
}

export interface SearchRepository {
  search(query: string, options?: SearchRepositoryOptions): Promise<SearchResults>;
  searchSongs(query: string, filters?: SongFilters): Promise<readonly SongSummary[]>;
  searchRhythms(query: string, filters?: RhythmFilters): Promise<readonly RhythmSummary[]>;
}

interface SearchRepositoryDependencies {
  readonly songs: SongRepository;
  readonly rhythms: RhythmRepository;
}

export function createSearchRepository(dependencies: SearchRepositoryDependencies): SearchRepository {
  async function searchSongs(query: string, filters: SongFilters = {}): Promise<readonly SongSummary[]> {
    return dependencies.songs.search(query, filters);
  }

  async function searchRhythms(query: string, filters: RhythmFilters = {}): Promise<readonly RhythmSummary[]> {
    return dependencies.rhythms.search(query, filters);
  }

  async function search(query: string, options: SearchRepositoryOptions = {}): Promise<SearchResults> {
    const [songs, rhythms] = await Promise.all([
      searchSongs(query, options.songFilters),
      searchRhythms(query, options.rhythmFilters),
    ]);

    return {
      songs,
      rhythms,
    };
  }

  return {
    search,
    searchSongs,
    searchRhythms,
  };
}

