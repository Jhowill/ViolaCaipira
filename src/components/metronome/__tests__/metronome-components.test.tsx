import { BeatIndicator } from "@/components/metronome/BeatIndicator";
import { MetronomeDial } from "@/components/metronome/MetronomeDial";
import { AppThemeContext } from "@/theme/context";
import { resolveTheme } from "@/theme/themes";
import type { AppThemeContextValue, ThemeMode } from "@/types/theme";
import type { MetronomeState } from "@/types/metronome";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pressable, type PressableStateCallbackType, type StyleProp, type ViewStyle } from "react-native";
import TestRenderer, { act, type ReactTestRendererJSON } from "react-test-renderer";

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

function createMetronomeState(overrides: Partial<MetronomeState> = {}): MetronomeState {
  return {
    status: "playing",
    bpm: 72,
    timeSignatureNumerator: 4,
    timeSignatureDenominator: 4,
    accentFirstBeat: true,
    countInBars: 1,
    visualPulseEnabled: true,
    beat: {
      barNumber: 1,
      beatInBar: 1,
      isAccentBeat: true,
      nextBeatAtMs: 10_000,
    },
    countIn: {
      barsRemaining: 0,
      beatsRemaining: 0,
      beatInCountIn: null,
    },
    tapTempo: {
      sampleCount: 3,
      bpmCandidate: 72,
      lastTapAtMs: 9_000,
      resetReason: "none",
    },
    error: null,
    revision: 1,
    updatedAt: "2026-07-12T00:00:00.000Z",
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("metronome components", () => {
  it("BeatIndicator comunica a batida atual e dispara callback", () => {
    const onPress = vi.fn();
    const state = createMetronomeState();

    const { renderer } = renderWithTheme(
      <BeatIndicator accentFirstBeat beat={state.beat} onPress={onPress} status={state.status} totalBeats={4} />,
    );

    expect(collectText(renderer.toJSON())).toContain("Batida atual");
    expect(collectText(renderer.toJSON())).toContain("1/4");
    expect(collectText(renderer.toJSON())).toContain("Ativo");
    expect(collectText(renderer.toJSON())).toContain("Acento");

    const pressable = findPressables(renderer)[0]!;
    act(() => {
      pressable.props.onPress?.();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("MetronomeDial mostra BPM tabular, estado e botões de controle", () => {
    const onPlayPress = vi.fn();
    const onPausePress = vi.fn();
    const onTapPress = vi.fn();
    const onIncreasePress = vi.fn();
    const onDecreasePress = vi.fn();
    const state = createMetronomeState({
      tapTempo: {
        sampleCount: 3,
        bpmCandidate: 72,
        lastTapAtMs: 9_000,
        resetReason: "none",
      },
    });

    const { renderer } = renderWithTheme(
      <MetronomeDial
        onDecreasePress={onDecreasePress}
        onIncreasePress={onIncreasePress}
        onPausePress={onPausePress}
        onPlayPress={onPlayPress}
        onTapPress={onTapPress}
        state={state}
      />,
    );

    expect(collectText(renderer.toJSON())).toContain("72");
    expect(collectText(renderer.toJSON())).toContain("BATIDAS POR MINUTO");
    expect(collectText(renderer.toJSON())).toContain("4/4");
    expect(collectText(renderer.toJSON())).toContain("Ativo");
    expect(collectText(renderer.toJSON())).toContain("Tap tempo");
    expect(collectText(renderer.toJSON())).toContain("3 toques");

    const pressables = findPressables(renderer);
    const decreaseButton = pressables.find((node) => node.props.accessibilityLabel === "Diminuir BPM");
    const mainButton = pressables.find((node) => node.props.accessibilityLabel === "Pausar metrônomo");
    const increaseButton = pressables.find((node) => node.props.accessibilityLabel === "Aumentar BPM");
    const tapButton = pressables.find((node) => node.props.accessibilityLabel === "Tap tempo");

    act(() => {
      decreaseButton?.props.onPress?.();
      mainButton?.props.onPress?.();
      increaseButton?.props.onPress?.();
      tapButton?.props.onPress?.();
    });

    expect(onDecreasePress).toHaveBeenCalledTimes(1);
    expect(onPausePress).toHaveBeenCalledTimes(1);
    expect(onIncreasePress).toHaveBeenCalledTimes(1);
    expect(onTapPress).toHaveBeenCalledTimes(1);
    expect(onPlayPress).not.toHaveBeenCalled();
  });
});
