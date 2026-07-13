import { useCallback, useEffect, useRef, useState } from "react";

import { getAppDatabaseClient } from "@/database/client";
import { createPreferencesRepository } from "@/repositories/preferencesRepository";
import { createTuningRepository } from "@/repositories/tuningRepository";
import { createChordRepository, type ChordRepository, type ChordShapeFilters, type ChordShapeView } from "@/repositories/chordRepository";
import { createErrorState, createLoadingState, createReadyState, normalizeError } from "@/repositories/contracts";
import type { AccidentalPreference, EntityRef } from "@/types/music";
import { formatChordSymbol, summarizeChordQuality } from "@/domain/music/chords";
import type { ResolvedChordQuery } from "@/domain/music/chords";

export interface UseChordsResult {
  readonly status: "loading" | "ready" | "error";
  readonly chord: ResolvedChordQuery | null;
  readonly symbol: string | null;
  readonly shapes: readonly ChordShapeView[];
  readonly recommendedShape: ChordShapeView | null;
  readonly alternatives: readonly ChordShapeView[];
  readonly query: string;
  readonly setQuery: (query: string) => void;
  readonly filters: ChordShapeFilters;
  readonly setFilters: (filters: ChordShapeFilters) => void;
  readonly error: Error | null;
  readonly refresh: () => Promise<readonly ChordShapeView[]>;
}

interface ChordsStateData {
  readonly chord: ResolvedChordQuery | null;
  readonly shapes: readonly ChordShapeView[];
}

let defaultChordRepositoryPromise:
  | Promise<ChordRepository>
  | null = null;

async function getDefaultChordRepository(): Promise<ChordRepository> {
  if (!defaultChordRepositoryPromise) {
    defaultChordRepositoryPromise = (async () => {
      const client = await getAppDatabaseClient();
      const preferences = createPreferencesRepository(client.database);
      const tunings = createTuningRepository(client.database, { preferencesRepository: preferences });
      return createChordRepository(client.database, { tuningRepository: tunings });
    })().catch((error: unknown) => {
      defaultChordRepositoryPromise = null;
      throw error;
    });
  }

  return defaultChordRepositoryPromise;
}

export async function resolveChordRepository(repository?: ChordRepository): Promise<ChordRepository> {
  if (repository) {
    return repository;
  }

  return getDefaultChordRepository();
}

function applyAccidentalPreference(shape: ChordShapeView, accidentalPreference: AccidentalPreference): ChordShapeView {
  if (accidentalPreference === "contextual") {
    return shape;
  }

  return {
    ...shape,
    symbol: formatChordSymbol(shape.chord, shape.quality, accidentalPreference),
  };
}

function mapShapeList(
  shapes: readonly ChordShapeView[],
  accidentalPreference: AccidentalPreference,
): readonly ChordShapeView[] {
  return shapes.map((shape) => applyAccidentalPreference(shape, accidentalPreference));
}

function deriveRecommendedShape(shapes: readonly ChordShapeView[]): ChordShapeView | null {
  return shapes[0] ?? null;
}

function deriveAlternatives(
  shapes: readonly ChordShapeView[],
  selectedShape: ChordShapeView | null,
): readonly ChordShapeView[] {
  if (!selectedShape) {
    return shapes;
  }

  return shapes.filter((shape) => shape.ref.id !== selectedShape.ref.id || shape.ref.origin !== selectedShape.ref.origin);
}

export function useChords(options: {
  readonly repository?: ChordRepository;
  readonly tuning: EntityRef<"tuning">;
  readonly accidentalPreference?: AccidentalPreference;
  readonly initialQuery?: string;
  readonly initialFilters?: ChordShapeFilters;
}): UseChordsResult {
  const repositoryRef = useRef<ChordRepository | undefined>(options.repository);
  repositoryRef.current = options.repository;
  const [query, setQuery] = useState(options.initialQuery ?? "");
  const [filters, setFilters] = useState<ChordShapeFilters>(options.initialFilters ?? {});
  const accidentalPreference = options.accidentalPreference ?? "contextual";
  const [state, setState] = useState(createLoadingState<ChordsStateData>());

  const refresh = useCallback(async (): Promise<readonly ChordShapeView[]> => {
    try {
      setState(createLoadingState<ChordsStateData>());
      const repository = await resolveChordRepository(repositoryRef.current);
      const chord = query.trim().length > 0 ? await repository.resolveChord(query) : null;

      if (!chord) {
        const emptyState = createReadyState<ChordsStateData>({
          chord: null,
          shapes: [],
        });
        setState(emptyState);
        return [];
      }

      const shapes = await repository.listShapes(options.tuning, chord.chord, filters);
      const mappedShapes = mapShapeList(shapes, accidentalPreference);

      setState(
        createReadyState<ChordsStateData>({
          chord,
          shapes: mappedShapes,
        }),
      );

      return mappedShapes;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<ChordsStateData>(normalized));
      throw normalized;
    }
  }, [accidentalPreference, filters, options.tuning, query]);

  useEffect(() => {
    let cancelled = false;

    void refresh().catch((error) => {
      if (cancelled) {
        return;
      }

      const normalized = normalizeError(error);
      setState(createErrorState<ChordsStateData>(normalized));
    });

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const chord = state.data?.chord ?? null;
  const shapes = state.data?.shapes ?? [];
  const recommendedShape = deriveRecommendedShape(shapes);
  const alternatives = deriveAlternatives(shapes, recommendedShape);
  const symbol =
    chord && chord.quality
      ? formatChordSymbol(chord.chord, summarizeChordQuality(chord.quality), accidentalPreference)
      : null;

  return {
    status: state.status,
    chord,
    symbol,
    shapes,
    recommendedShape,
    alternatives,
    query,
    setQuery,
    filters,
    setFilters,
    error: state.error,
    refresh,
  };
}
