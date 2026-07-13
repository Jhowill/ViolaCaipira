import { ChordCard } from "@/components/chords/ChordCard";
import { ChordDiagram } from "@/components/chords/ChordDiagram";
import { ChordShapeSelector } from "@/components/chords/ChordShapeSelector";
import { ChordStatusBadge } from "@/components/chords/ChordStatusBadge";
import { resolveChordDiagramLayout } from "@/utils/chordDiagramLayout";
import { AppThemeContext } from "@/theme/context";
import { resolveTheme } from "@/theme/themes";
import type { ChordShapeDetails } from "@/types/music";
import type { AppThemeContextValue, ThemeMode } from "@/types/theme";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pressable, StyleSheet, Text, View, type PressableStateCallbackType, type StyleProp, type ViewStyle } from "react-native";
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
    readonly onPress?: () => void;
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

function createChordShape(): ChordShapeDetails {
  return {
    id: "shape-d-major",
    origin: "catalog",
    chord: {
      rootPitchClass: 2,
      qualityId: "major",
      bassPitchClass: null,
    },
    tuning: {
      type: "tuning",
      origin: "catalog",
      id: "catalog-tuning-d",
    },
    positions: [
      {
        physicalStringNumber: 1,
        courseNumber: 1,
        stringInCourse: 1,
        fret: 0,
        finger: null,
        pitchClass: 2,
        octave: 3,
        intervalLabel: null,
      },
      {
        physicalStringNumber: 2,
        courseNumber: 1,
        stringInCourse: 2,
        fret: -1,
        finger: null,
        pitchClass: null,
        octave: null,
        intervalLabel: null,
      },
      {
        physicalStringNumber: 3,
        courseNumber: 2,
        stringInCourse: 1,
        fret: 2,
        finger: "2",
        pitchClass: 6,
        octave: 3,
        intervalLabel: null,
      },
      {
        physicalStringNumber: 4,
        courseNumber: 2,
        stringInCourse: 2,
        fret: 2,
        finger: "2",
        pitchClass: 6,
        octave: 4,
        intervalLabel: null,
      },
      {
        physicalStringNumber: 5,
        courseNumber: 3,
        stringInCourse: 1,
        fret: 3,
        finger: "3",
        pitchClass: 9,
        octave: 3,
        intervalLabel: null,
      },
      {
        physicalStringNumber: 6,
        courseNumber: 3,
        stringInCourse: 2,
        fret: 3,
        finger: "3",
        pitchClass: 9,
        octave: 4,
        intervalLabel: null,
      },
      {
        physicalStringNumber: 7,
        courseNumber: 4,
        stringInCourse: 1,
        fret: 0,
        finger: null,
        pitchClass: 2,
        octave: 4,
        intervalLabel: null,
      },
      {
        physicalStringNumber: 8,
        courseNumber: 4,
        stringInCourse: 2,
        fret: 0,
        finger: null,
        pitchClass: 2,
        octave: 5,
        intervalLabel: null,
      },
      {
        physicalStringNumber: 9,
        courseNumber: 5,
        stringInCourse: 1,
        fret: 0,
        finger: null,
        pitchClass: 6,
        octave: 4,
        intervalLabel: null,
      },
      {
        physicalStringNumber: 10,
        courseNumber: 5,
        stringInCourse: 2,
        fret: 0,
        finger: null,
        pitchClass: 6,
        octave: 5,
        intervalLabel: null,
      },
    ],
    barres: [
      {
        fret: 1,
        fromPhysicalString: 1,
        toPhysicalString: 5,
        finger: "1",
      },
    ],
    difficulty: "easy",
    verificationStatus: "verified",
    isRecommended: true,
  };
}

function findPressables(renderer: ReturnType<typeof TestRenderer.create>) {
  return renderer.root.findAllByType(Pressable) as unknown as PressableNode[];
}

function resolveStyle(instance: PressableNode) {
  const state: PressableStateCallbackType & {
    readonly focused?: boolean;
    readonly hovered?: boolean;
  } = { pressed: false, focused: false, hovered: false };

  return StyleSheet.flatten(instance.props.style(state));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("chord components", () => {
  it("ChordStatusBadge e ChordShapeSelector mantêm rótulos e callbacks", () => {
    const onRootChange = vi.fn();
    const onQualityChange = vi.fn();

    const { renderer } = renderWithTheme(
      <View>
        <ChordStatusBadge icon="\u2713" label="Verificado" tone="success" />
        <ChordShapeSelector
          sections={[
            {
              title: "Nota fundamental",
              onChange: onRootChange,
              options: [
                { label: "D", value: "D", selected: true },
                { label: "E", value: "E" },
              ],
            },
            {
              title: "Qualidade",
              onChange: onQualityChange,
              options: [
                { label: "Maior", value: "major", selected: true },
                { label: "Menor", value: "minor" },
              ],
            },
          ]}
        />
      </View>,
    );

    expect(collectText(renderer.toJSON())).toContain("Verificado");
    expect(collectText(renderer.toJSON())).toContain("Nota fundamental");
    expect(collectText(renderer.toJSON())).toContain("Qualidade");

    const pressables = findPressables(renderer);
    expect(pressables).toHaveLength(4);

    act(() => {
      pressables[1]?.props.onPress?.();
      pressables[3]?.props.onPress?.();
    });

    expect(onRootChange).toHaveBeenCalledWith("E");
    expect(onQualityChange).toHaveBeenCalledWith("minor");
  });

  it("resolveChordDiagramLayout espelha o modo canhoto e descreve pestana e abafadas", () => {
    const shape = createChordShape();
    const layout = resolveChordDiagramLayout(shape, { mode: "ten_strings", leftHanded: true });

    expect(layout.strings[0]?.label).toBe("Corda 10");
    expect(layout.strings[layout.strings.length - 1]?.label).toBe("Corda 1");
    expect(layout.accessibilityLabel).toContain("abafada");
    expect(layout.accessibilityLabel).toContain("pestana");
    expect(layout.accessibilityLabel).toContain("pestana na casa 1");
  });

  it("ChordDiagram mostra pestana, corda abafada e notas em modo detalhado", () => {
    const shape = createChordShape();

    const { renderer } = renderWithTheme(
      <ChordDiagram density="detailed" mode="ten_strings" shape={shape} showIntervals showNotes />,
    );

    const diagram = renderer.root.findAllByProps({ accessibilityRole: "image" })[0]!;
    expect(String(diagram.props["accessibilityLabel"])).toContain("abafada");
    expect(String(diagram.props["accessibilityLabel"])).toContain("pestana");
    expect(String(diagram.props["accessibilityLabel"])).toContain("Corda 2 abafada");

    expect(collectText(renderer.toJSON())).toContain("×");
    expect(collectText(renderer.toJSON())).toContain("1");
  });

  it("ChordCard expõe favoritos, badges e diagramas", () => {
    const onPress = vi.fn();
    const onFavoritePress = vi.fn();

    const { renderer, value } = renderWithTheme(
      <ChordCard
        badges={[
          { label: "Verificado", tone: "success", icon: "\u2713" },
          { label: "Fácil", tone: "accent" },
        ]}
        diagram={<Text>Diagrama</Text>}
        favorite
        onFavoritePress={onFavoritePress}
        onPress={onPress}
        selected
        symbol="D"
        subtitle="Posição aberta recomendada"
        title="Ré maior"
      />,
    );

    expect(collectText(renderer.toJSON())).toContain("Diagrama");
    expect(collectText(renderer.toJSON())).toContain("Verificado");
    expect(collectText(renderer.toJSON())).toContain("Fácil");

    const rootPressable = findPressables(renderer).find((node) => node.props.accessibilityLabel === "D. Ré maior. Posição aberta recomendada");
    expect(rootPressable).toBeTruthy();
    expect(rootPressable?.props.accessibilityState).toMatchObject({ selected: true });

    const rootStyle = resolveStyle(rootPressable!);
    expect(rootStyle.borderColor).toBe(value.theme.colors.primary);

    act(() => {
      rootPressable?.props.onPress?.();
      findPressables(renderer).find((node) => node.props.accessibilityLabel === "Remover Ré maior dos favoritos")?.props.onPress?.();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onFavoritePress).toHaveBeenCalledTimes(1);
  });
});
