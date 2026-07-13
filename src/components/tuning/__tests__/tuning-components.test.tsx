import { ActiveTuningPill } from "@/components/tuning/ActiveTuningPill";
import { ReferenceSoundButton } from "@/components/tuning/ReferenceSoundButton";
import { StringPairVisual } from "@/components/tuning/StringPairVisual";
import { TuningCourseRow } from "@/components/tuning/TuningCourseRow";
import { TuningStatusBadge } from "@/components/tuning/TuningStatusBadge";
import { midiToFrequency, pitchClassToMidi } from "@/domain/music/conversions";
import { AppThemeContext } from "@/theme/context";
import { resolveTheme } from "@/theme/themes";
import type { AppThemeContextValue, ThemeMode } from "@/types/theme";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Pressable,
  StyleSheet,
  View,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import TestRenderer, { act, type ReactTestRendererJSON } from "react-test-renderer";

type PressableNode = {
  readonly props: {
    readonly style: (state: PressableStateCallbackType) => StyleProp<ViewStyle>;
    readonly accessibilityLabel?: string;
    readonly accessibilityState?: {
      readonly disabled?: boolean;
      readonly busy?: boolean;
      readonly selected?: boolean;
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

function createString(
  id: string,
  physicalStringNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
  pitchClass: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11,
  octave: number,
  stringInCourse: 1 | 2,
) {
  const midiNote = pitchClassToMidi(pitchClass, octave);

  return {
    id,
    physicalStringNumber,
    stringInCourse,
    pitchClass,
    octave,
    midiNote,
    referenceFrequency440: midiToFrequency(midiNote),
  } as const;
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

describe("tuning components", () => {
  it("TuningStatusBadge resume os estados com texto e acessibilidade", () => {
    const { renderer } = renderWithTheme(
      <View>
        <TuningStatusBadge cents={2.4} status="tuned" />
        <TuningStatusBadge cents={8} status="below" />
        <TuningStatusBadge status="incompatible" />
      </View>,
    );

    expect(collectText(renderer.toJSON())).toContain("Afinada");
    expect(collectText(renderer.toJSON())).toContain("Abaixo");
    expect(collectText(renderer.toJSON())).toContain("Incompatível");

    const badges = renderer.root.findAllByType(View).filter((node) =>
      typeof node.props["accessibilityRole"] === "string" && node.props["accessibilityRole"] === "text",
    );

    expect(badges.length).toBeGreaterThanOrEqual(3);
  });

  it("ActiveTuningPill mantém hierarquia visual e variante somente leitura", () => {
    const onPress = vi.fn();

    const { renderer, value } = renderWithTheme(
      <ActiveTuningPill detail="Cebolão mais usado no repertório" onPress={onPress} value="Cebolão em Ré" />,
    );

    const pressable = findPressables(renderer)[0]!;
    const style = resolveStyle(pressable);

    expect(style.borderColor).toBe(value.theme.colors.border);
    expect(collectText(renderer.toJSON())).toContain("Afinação ativa");
    expect(collectText(renderer.toJSON())).toContain("Cebolão em Ré");

    act(() => {
      pressable.props.onPress?.();
    });

    expect(onPress).toHaveBeenCalledTimes(1);

    const readOnlyRenderer = renderWithTheme(
      <ActiveTuningPill variant="readOnly" value="Cebolão em Mi" />,
    ).renderer;

    expect(findPressables(readOnlyRenderer)).toHaveLength(0);
  });

  it("ReferenceSoundButton alterna entre botão compacto e cartão em sequência", () => {
    const onCompactPress = vi.fn();
    const onBannerPress = vi.fn();

    const compact = renderWithTheme(
      <ReferenceSoundButton accessibilityLabel="Tocar D4" layout="compact" onPress={onCompactPress} />,
    ).renderer;

    const compactPressable = findPressables(compact)[0]!;
    const compactStyle = resolveStyle(compactPressable);

    expect(compactStyle.width).toBe(44);

    act(() => {
      compactPressable.props.onPress?.();
    });

    expect(onCompactPress).toHaveBeenCalledTimes(1);

    const banner = renderWithTheme(
      <ReferenceSoundButton
        description="Da 1ª ordem à 5ª ordem"
        layout="banner"
        onPress={onBannerPress}
        title="Cinco pares em sequência"
      />,
    ).renderer;

    expect(collectText(banner.toJSON())).toContain("Cinco pares em sequência");
    expect(collectText(banner.toJSON())).toContain("Da 1ª ordem à 5ª ordem");

    const bannerPressable = findPressables(banner)[0]!;
    act(() => {
      bannerPressable.props.onPress?.();
    });

    expect(onBannerPress).toHaveBeenCalledTimes(1);
  });

  it("StringPairVisual destaca a string em foco e comunica o tipo do par", () => {
    const strings = [
      createString("string-1", 1, 2, 3, 1),
      createString("string-2", 2, 2, 4, 2),
    ] as const;

    const { renderer } = renderWithTheme(
      <StringPairVisual
        highlightedStringInCourse={2}
        pairType="octave"
        strings={strings}
      />,
    );

    expect(collectText(renderer.toJSON())).toContain("Oitavado");
    expect(collectText(renderer.toJSON())).toContain("Corda 1");
    expect(collectText(renderer.toJSON())).toContain("D3");
    expect(collectText(renderer.toJSON())).toContain("Corda 2");
    expect(collectText(renderer.toJSON())).toContain("D4");
  });

  it("TuningCourseRow expõe ordem, notas, estado e ação de referência", () => {
    const onPress = vi.fn();
    const onReferencePress = vi.fn();
    const strings = [
      createString("string-3", 3, 2, 3, 1),
      createString("string-4", 4, 2, 3, 2),
    ] as const;

    const { renderer, value } = renderWithTheme(
      <TuningCourseRow
        courseNumber={1}
        onPress={onPress}
        onReferencePress={onReferencePress}
        pairType="unison"
        selected
        status="tuned"
        strings={strings}
      />,
    );

    expect(collectText(renderer.toJSON())).toContain("1ª");
    expect(collectText(renderer.toJSON())).toContain("D3 · D3");
    expect(collectText(renderer.toJSON())).toContain("Uníssono");
    expect(collectText(renderer.toJSON())).toContain("Afinada");

    const rootPressable = findPressables(renderer).find((node) =>
      node.props.accessibilityLabel?.startsWith("Ordem 1ª"),
    );
    expect(rootPressable).toBeTruthy();
    expect(rootPressable?.props.accessibilityState).toMatchObject({ selected: true });

    const rootStyle = resolveStyle(rootPressable!);
    expect(rootStyle.borderColor).toBe(value.theme.colors.primary);

    act(() => {
      rootPressable?.props.onPress?.();
    });

    expect(onPress).toHaveBeenCalledTimes(1);

    const allPressables = findPressables(renderer);
    const referenceButton = allPressables.find((node) => node.props.accessibilityLabel === "Tocar referência da 1ª ordem");
    expect(referenceButton).toBeTruthy();

    act(() => {
      referenceButton?.props.onPress?.();
    });

    expect(onReferencePress).toHaveBeenCalledTimes(1);
  });

  it("TuningCourseRow em modo incompatível permanece legível e não vira botão principal", () => {
    const strings = [
      createString("string-5", 5, 7, 3, 1),
      createString("string-6", 6, 7, 4, 2),
    ] as const;

    const { renderer } = renderWithTheme(
      <TuningCourseRow
        courseNumber={3}
        pairType="octave"
        variant="incompatible"
        strings={strings}
      />,
    );

    expect(collectText(renderer.toJSON())).toContain("Incompatível");
    expect(findPressables(renderer)).toHaveLength(0);
  });
});
