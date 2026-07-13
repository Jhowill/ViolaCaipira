import { useCallback, useEffect, useRef, useState } from "react";

import { createErrorState, createLoadingState, createReadyState, normalizeError } from "@/repositories/contracts";
import type { ChordRepository, ChordShapeFilters, ChordShapeView } from "@/repositories/chordRepository";
import type { AccidentalPreference, ContentOrigin } from "@/types/music";
import { formatChordSymbol } from "@/domain/music/chords";
import { resolveChordRepository } from "@/hooks/useChords";

export interface UseChordShapeResult {
  readonly status: "loading" | "ready" | "error";
  readonly shape: ChordShapeView | null;
  readonly recommendedShape: ChordShapeView | null;
  readonly alternatives: readonly ChordShapeView[];
  readonly error: Error | null;
  readonly refresh: () => Promise<ChordShapeView | null>;
}

interface ChordShapeStateData {
  readonly shape: ChordShapeView | null;
  readonly recommendedShape: ChordShapeView | null;
  readonly alternatives: readonly ChordShapeView[];
}

const EMPTY_CHORD_SHAPE_FILTERS: ChordShapeFilters = Object.freeze({});

function applyAccidentalPreference(shape: ChordShapeView, accidentalPreference: AccidentalPreference): ChordShapeView {
  if (accidentalPreference === "contextual") {
    return shape;
  }

  return {
    ...shape,
    symbol: formatChordSymbol(shape.chord, shape.quality, accidentalPreference),
  };
}

function mapShapes(
  shapes: readonly ChordShapeView[],
  accidentalPreference: AccidentalPreference,
): readonly ChordShapeView[] {
  return shapes.map((shape) => applyAccidentalPreference(shape, accidentalPreference));
}

function deriveRecommendedShape(shapes: readonly ChordShapeView[]): ChordShapeView | null {
  return shapes[0] ?? null;
}

function excludeCurrentShape(
  shapes: readonly ChordShapeView[],
  current: ChordShapeView | null,
): readonly ChordShapeView[] {
  if (!current) {
    return shapes;
  }

  return shapes.filter((shape) => shape.ref.id !== current.ref.id || shape.ref.origin !== current.ref.origin);
}

async function resolveShapeByOrigin(
  repository: ChordRepository,
  shapeId: string,
  origin: ContentOrigin | "all",
): Promise<ChordShapeView | null> {
  if (origin !== "all") {
    return repository.getShape({
      type: "chord_shape",
      origin,
      id: shapeId,
    });
  }

  const catalog = await repository.getShape({
    type: "chord_shape",
    origin: "catalog",
    id: shapeId,
  });

  if (catalog) {
    return catalog;
  }

  return repository.getShape({
    type: "chord_shape",
    origin: "user",
    id: shapeId,
  });
}

export function useChordShape(options: {
  readonly repository?: ChordRepository;
  readonly shapeId: string;
  readonly origin?: ContentOrigin | "all";
  readonly accidentalPreference?: AccidentalPreference;
  readonly filters?: ChordShapeFilters;
}): UseChordShapeResult {
  const repositoryRef = useRef<ChordRepository | undefined>(options.repository);
  repositoryRef.current = options.repository;
  const [state, setState] = useState(createLoadingState<ChordShapeStateData>());
  const accidentalPreference = options.accidentalPreference ?? "contextual";
  const shapeId = options.shapeId;
  const origin = options.origin ?? "all";
  const filters = options.filters ?? EMPTY_CHORD_SHAPE_FILTERS;

  const refresh = useCallback(async (): Promise<ChordShapeView | null> => {
    try {
      setState(createLoadingState<ChordShapeStateData>());
      const repository = await resolveChordRepository(repositoryRef.current);
      const resolvedShape = await resolveShapeByOrigin(repository, shapeId, origin);

      if (!resolvedShape) {
        setState(
          createReadyState<ChordShapeStateData>({
            shape: null,
            recommendedShape: null,
            alternatives: [],
          }),
        );
        return null;
      }

      const shapes = await repository.listShapes(resolvedShape.tuning, resolvedShape.chord, {
        ...filters,
        origin: filters.origin ?? "all",
      });

      const normalizedShapes = mapShapes(shapes, accidentalPreference);
      const normalizedShape = applyAccidentalPreference(resolvedShape, accidentalPreference);
      const recommendedShape = deriveRecommendedShape(normalizedShapes);
      const alternatives = excludeCurrentShape(normalizedShapes, normalizedShape);

      setState(
        createReadyState<ChordShapeStateData>({
          shape: normalizedShape,
          recommendedShape,
          alternatives,
        }),
      );

      return normalizedShape;
    } catch (error) {
      const normalized = normalizeError(error);
      setState(createErrorState<ChordShapeStateData>(normalized));
      throw normalized;
    }
  }, [accidentalPreference, filters, origin, shapeId]);

  useEffect(() => {
    let cancelled = false;

    void refresh().catch((error) => {
      if (cancelled) {
        return;
      }

      const normalized = normalizeError(error);
      setState(createErrorState<ChordShapeStateData>(normalized));
    });

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const shape = state.data?.shape ?? null;
  const recommendedShape = state.data?.recommendedShape ?? null;
  const alternatives = state.data?.alternatives ?? [];

  return {
    status: state.status,
    shape,
    recommendedShape,
    alternatives,
    error: state.error,
    refresh,
  };
}
