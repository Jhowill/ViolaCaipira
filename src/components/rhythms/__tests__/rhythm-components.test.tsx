import { AppThemeContext } from "@/theme/context";
import { resolveTheme } from "@/theme/themes";
import type { AppThemeContextValue, ThemeMode } from "@/types/theme";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pressable, type PressableStateCallbackType, type StyleProp, type ViewStyle } from "react-native";
import TestRenderer, { act, type ReactTestRendererJSON } from "react-test-renderer";
import { RhythmCard } from "@/components/rhythms/RhythmCard";
import { RhythmPattern } from "@/components/rhythms/RhythmPattern";
import { RhythmStep } from "@/components/rhythms/RhythmStep";
import type { RhythmPatternView, RhythmStepView, RhythmSummary } from "@/repositories/rhythmRepository";

type PressableNode = {
  readonly props: {
    readonly style: (state: PressableStateCallbackType) => StyleProp<ViewStyle>;
    readonly accessibilityLabel?: string;
    readonly accessibilityState?: {
      readonly disabled?: boolean;
      readonly selected?: boolean;
      readonly busy?: boolean;
    };
    readonly onPress?: (event?: { readonly stopPropagation?: () => void }) => void;
  };
};

function createThemeContext(mode: ThemeMode, systemColorScheme: "light" | "dark" = "light"): AppThemeContextValue {
  return {
    theme: resolveTheme({
      mode,
      systemColorScheme,
      fontsLoaded: true,
      reduceMotion: false,
      platform: "default",
    }),
    mode,
    setMode: vi.fn(),
    fontsLoaded: true,
    fontLoadError: null,
  };
}

function renderWithTheme(
  element: React.ReactElement,
  mode: ThemeMode = "light",
  systemColorScheme: "light" | "dark" = "light",
) {
  const value = createThemeContext(mode, systemColorScheme);

  let renderer: ReturnType<typeof TestRenderer.create> | undefined;
  act(() => {
    renderer = TestRenderer.create(
      <AppThemeContext.Provider value={value}>{element}</AppThemeContext.Provider>,
    );
  });

  return { renderer: renderer as ReturnType<typeof TestRenderer.create>, value };
}

function collectText(node: ReactTestRendererJSON | ReactTestRendererJSON[] | string | null): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }

  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map((child) => collectText(child)).join("");
  }

  if (typeof node === "object" && node !== null && "children" in node) {
    const children = (node as { children?: ReactTestRendererJSON["children"] }).children;
    return collectText((children ?? null) as ReactTestRendererJSON | ReactTestRendererJSON[] | string | null);
  }

  return "";
}

function findPressables(renderer: ReturnType<typeof TestRenderer.create>) {
  return renderer.root.findAllByType(Pressable) as unknown as PressableNode[];
}

function createRhythmStep(overrides: Partial<RhythmStepView> = {}): RhythmStepView {
  return {
    id: "step-1",
    patternId: "pattern-1",
    stepOrder: 1,
    positionTicks: 0,
    durationTicks: 1,
    beatLabel: "1",
    direction: "down",
    action: "strike",
    handPart: "thumb",
    stringRangeFrom: 1,
    stringRangeTo: 4,
    intensity: 0.8,
    isAccent: true,
    label: "Forte",
    ...overrides,
  };
}

function createRhythmPattern(steps: readonly RhythmStepView[]): RhythmPatternView {
  return {
    ref: { type: "rhythm_pattern", origin: "catalog", id: "pattern-cururu" },
    rhythmRef: { type: "rhythm", origin: "catalog", id: "rhythm-cururu" },
    name: "Cururu",
    level: "beginner",
    handMode: "neutral",
    totalTicks: 16,
    bars: 4,
    isPrimary: true,
    sortOrder: 0,
    notes: "Padrão tradicional",
    steps,
    audio: [],
  };
}

function createRhythmSummary(pattern: RhythmPatternView): RhythmSummary {
  return {
    ref: { type: "rhythm", origin: "catalog", id: "rhythm-cururu" },
    name: "Cururu",
    shortDescription: "Padrão tradicional com acento forte.",
    timeSignatureNumerator: 2,
    timeSignatureDenominator: 4,
    timeSignatureLabel: "2/4",
    bpm: 84,
    difficulty: "beginner",
    originRegion: "tradicional",
    isFavorite: true,
    previewPattern: pattern,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("rhythm components", () => {
  it("RhythmStep mostra direção, ação, intensidade e chama o callback", () => {
    const onPress = vi.fn();
    const step = createRhythmStep({
      action: "mute",
      direction: "down",
      intensity: 0.9,
      stringRangeFrom: 2,
      stringRangeTo: 5,
      handPart: "index",
    });

    const { renderer } = renderWithTheme(
      <RhythmStep onPress={onPress} state="current" step={step} />,
    );

    const pressable = findPressables(renderer)[0]!;

    expect(collectText(renderer.toJSON())).toContain("Passo");
    expect(collectText(renderer.toJSON())).toContain("Abafa");
    expect(collectText(renderer.toJSON())).toContain("Forte");
    expect(collectText(renderer.toJSON())).toContain("Acento");
    expect(collectText(renderer.toJSON())).toContain("Cordas 2–5");
    expect(pressable.props.accessibilityState).toMatchObject({ selected: true });

    act(() => {
      pressable.props.onPress?.();
    });

    expect(onPress).toHaveBeenCalledWith(step);

    const leftHandedRenderer = renderWithTheme(
      <RhythmStep leftHanded onPress={vi.fn()} step={step} />,
    ).renderer;

    const leftHandedPressable = findPressables(leftHandedRenderer)[0]!;
    expect(leftHandedPressable.props.accessibilityLabel).toContain("Direção ↑");
  });

  it("RhythmPattern agrupa os passos e mantém a legenda e a leitura canhota", () => {
    const stepOne = createRhythmStep({ id: "step-1", stepOrder: 1, beatLabel: "1", direction: "down" });
    const stepTwo = createRhythmStep({
      id: "step-2",
      stepOrder: 2,
      beatLabel: "&",
      direction: "up",
      action: "rest",
      intensity: 0,
      isAccent: false,
      label: "Pausa",
    });
    const pattern = createRhythmPattern([stepOne, stepTwo]);

    const { renderer } = renderWithTheme(
      <RhythmPattern
        currentStepId="step-2"
        leftHanded
        pattern={pattern}
        showLegend
        title="Padrão principal"
      />,
    );

    expect(collectText(renderer.toJSON())).toContain("Padrão principal");
    expect(collectText(renderer.toJSON())).toContain("Canhoto");
    expect(collectText(renderer.toJSON())).toContain("Atual");
    expect(collectText(renderer.toJSON())).toContain("Pausa");
    expect(collectText(renderer.toJSON())).toContain("↓ para baixo");
    expect(collectText(renderer.toJSON())).toContain("× abafamento");
    expect(collectText(renderer.toJSON())).toContain("— pausa");
  });

  it("RhythmCard resume o ritmo, mostra a prévia e dispara ações", () => {
    const pattern = createRhythmPattern([
      createRhythmStep({ id: "step-1", stepOrder: 1 }),
      createRhythmStep({ id: "step-2", stepOrder: 2, direction: "up", action: "rest", intensity: 0 }),
    ]);
    const rhythm = createRhythmSummary(pattern);
    const onPress = vi.fn();
    const onFavoritePress = vi.fn();

    const { renderer } = renderWithTheme(
      <RhythmCard
        leftHanded
        onFavoritePress={onFavoritePress}
        onPress={onPress}
        rhythm={rhythm}
        showPreview
      />,
    );

    expect(collectText(renderer.toJSON())).toContain("Cururu");
    expect(collectText(renderer.toJSON())).toContain("2/4");
    expect(collectText(renderer.toJSON())).toContain("84 BPM");
    expect(collectText(renderer.toJSON())).toContain("Padrão tradicional com acento forte.");
    expect(collectText(renderer.toJSON())).toContain("Pausa");

    const pressables = findPressables(renderer);
    const favoriteButton = pressables.find((instance) => instance.props.accessibilityLabel === "Remover dos favoritos");
    const cardPressable = pressables.find((instance) => instance.props.accessibilityLabel?.startsWith("Cururu."));

    act(() => {
      favoriteButton?.props.onPress?.();
      cardPressable?.props.onPress?.();
    });

    expect(onFavoritePress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
