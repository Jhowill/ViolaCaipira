import { createTunerTarget } from "@/domain/tuner";
import { AppThemeContext } from "@/theme/context";
import { resolveTheme } from "@/theme/themes";
import type { AppThemeContextValue, ThemeMode } from "@/types/theme";
import type { TunerGuidedProgress } from "@/types/tuner";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Pressable,
  StyleSheet,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import TestRenderer, { act, type ReactTestRendererJSON } from "react-test-renderer";
import { DetectedNote } from "@/components/tuner/DetectedNote";
import { SignalQuality } from "@/components/tuner/SignalQuality";
import { TunerGauge } from "@/components/tuner/TunerGauge";
import { TuningProgress } from "@/components/tuner/TuningProgress";

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

afterEach(() => {
  vi.restoreAllMocks();
});

describe("tuner components", () => {
  it("SignalQuality comunica qualidade, detalhe e ícone", () => {
    const { renderer, value } = renderWithTheme(
      <SignalQuality quality="weak" sampleCount={2} weaknessReason="invalid_frequency" />,
      "highContrast",
      "dark",
    );

    const root = renderer.root.findAllByProps({ accessibilityRole: "text" })[0]!;
    const style = StyleSheet.flatten((root.props as { readonly style?: unknown }).style) as ViewStyle;

    expect(collectText(renderer.toJSON())).toContain("Sinal fraco");
    expect(collectText(renderer.toJSON())).toContain("Frequência inválida");
    expect((root.props as { readonly [key: string]: unknown })["accessibilityLabel"]).toContain("Sinal fraco");
    expect(style.borderWidth).toBe(value.theme.borderWidth);
  });

  it("DetectedNote mostra nota, alvo, frequência, instrução e qualidade do sinal", () => {
    const { renderer } = renderWithTheme(
      <DetectedNote
        frequencyLabel="293,66 Hz"
        instructionLabel="Aperte lentamente"
        noteLabel="F#4"
        signalQuality="stable"
        signalQualityDetail="0 cents"
        targetLabel="D4"
      />,
    );

    expect(collectText(renderer.toJSON())).toContain("Nota detectada");
    expect(collectText(renderer.toJSON())).toContain("F#4");
    expect(collectText(renderer.toJSON())).toContain("D4");
    expect(collectText(renderer.toJSON())).toContain("293,66 Hz");
    expect(collectText(renderer.toJSON())).toContain("Aperte lentamente");
    expect(collectText(renderer.toJSON())).toContain("Sinal adequado");
    expect(collectText(renderer.toJSON())).toContain("0 cents");
  });

  it.each([
    { cents: 0, expectedRotate: "0deg", expectedLabel: "0 cents" },
    { cents: 120, expectedRotate: "70deg", expectedLabel: "+120 cents" },
    { cents: -120, expectedRotate: "-70deg", expectedLabel: "-120 cents" },
  ])("TunerGauge centraliza zero e clampa o ponteiro", ({ cents, expectedRotate, expectedLabel }) => {
    const { renderer } = renderWithTheme(
      <TunerGauge cents={cents} signalQuality="stable" statusLabel={cents === 0 ? "Afinada" : "Ajuste"} />,
    );

    const needle = renderer.root.findAllByProps({ testID: "tuner-gauge-needle" })[0]!;
    const style = StyleSheet.flatten((needle.props as { readonly style?: unknown }).style) as ViewStyle;
    const transform = style.transform as readonly { readonly rotate?: string }[] | undefined;

    expect(transform?.[0]?.rotate).toBe(expectedRotate);
    expect(collectText(renderer.toJSON())).toContain(expectedLabel);
    expect(collectText(renderer.toJSON())).toContain(cents === 0 ? "Afinada" : "Ajuste");
  });

  it("TuningProgress marca a etapa atual e aciona a etapa tocada", () => {
    const targetOne = createTunerTarget({
      label: "D4",
      pitchClass: 2,
      octave: 4,
      calibrationA4: 440,
      courseNumber: 1,
      stringInCourse: 1,
    });
    const targetTwo = createTunerTarget({
      label: "A3",
      pitchClass: 9,
      octave: 3,
      calibrationA4: 440,
      courseNumber: 2,
      stringInCourse: 1,
    });
    const onStepPress = vi.fn();
    const progress: TunerGuidedProgress = {
      targets: [targetOne, targetTwo],
      index: 0,
      completedCount: 0,
      totalCount: 2,
      canAdvance: false,
      isComplete: false,
    };

    const { renderer } = renderWithTheme(
      <TuningProgress
        description="Siga uma corda por vez"
        onStepPress={onStepPress}
        progress={progress}
        stepLabels={["1ª corda", "2ª corda"]}
        title="Sequência guiada"
      />,
    );

    expect(collectText(renderer.toJSON())).toContain("1 de 2");
    expect(collectText(renderer.toJSON())).toContain("Siga uma corda por vez");

    const pressables = findPressables(renderer);
    const firstStep = pressables.find((node) => node.props.accessibilityLabel === "Abrir etapa 1ª corda");
    const secondStep = pressables.find((node) => node.props.accessibilityLabel === "Abrir etapa 2ª corda");

    expect(firstStep?.props.accessibilityState).toMatchObject({ selected: true });
    expect(secondStep?.props.accessibilityState).toMatchObject({ selected: false });

    act(() => {
      secondStep?.props.onPress?.();
    });

    expect(onStepPress).toHaveBeenCalledWith({ target: targetTwo, index: 1 });
  });
});
