import { AppThemeContext } from "@/theme/context";
import { resolveTheme } from "@/theme/themes";
import type { AppThemeContextValue, ThemeMode } from "@/types/theme";
import type {
  SongLineDocument,
  SongSectionDocument,
  SongSegmentDocumentChord,
} from "@/types/music";
import { AutoScrollControl } from "@/components/songs/AutoScrollControl";
import { ChordLine } from "@/components/songs/ChordLine";
import { ChordPreviewSheet } from "@/components/songs/ChordPreviewSheet";
import { SongHeader } from "@/components/songs/SongHeader";
import { SongRow } from "@/components/songs/SongRow";
import { SongSection } from "@/components/songs/SongSection";
import { TransposeControl } from "@/components/songs/TransposeControl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pressable, Text, type PressableStateCallbackType, type StyleProp, type ViewStyle } from "react-native";
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

function findPressableByLabel(renderer: ReturnType<typeof TestRenderer.create>, label: string) {
  const pressables = renderer.root.findAllByType(Pressable) as unknown as PressableNode[];
  return pressables.find((instance) => instance.props.accessibilityLabel === label);
}

function createChordSegment(
  id: string,
  rootPitchClass: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11,
  originalSpelling: string,
): SongSegmentDocumentChord {
  return {
    id,
    type: "chord",
    chord: {
      rootPitchClass,
      qualityId: "major",
      bassPitchClass: null,
      originalSpelling,
      harmonicDegree: null,
    },
    anchorOffset: 0,
  };
}

function createSongLine(): SongLineDocument {
  return {
    id: "line-verse-1",
    type: "lyrics",
    segments: [
      createChordSegment("chord-1", 2, "D"),
      { id: "text-1", type: "text", text: "No caminho da serra" },
      createChordSegment("chord-2", 9, "Bm"),
      { id: "text-2", type: "text", text: "e eu ouvi a viola" },
    ],
  };
}

function createSongSection(): SongSectionDocument {
  return {
    id: "section-verse-1",
    type: "verse",
    label: "Verso 1",
    repeatCount: 2,
    lines: [createSongLine()],
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("songs components", () => {
  it("SongRow mostra metadados e aciona favoritos e menu", () => {
    const onPress = vi.fn();
    const onFavoritePress = vi.fn();
    const onMorePress = vi.fn();

    const { renderer } = renderWithTheme(
      <SongRow
        accessibilityLabel="Linha de cifra"
        badges={[
          { label: "Cebolão em Ré", variant: "selection" },
          { label: "Cururu", variant: "tag" },
          { label: "Fácil", variant: "status" },
        ]}
        description="Composição original • Tom D"
        favorite
        onFavoritePress={onFavoritePress}
        onMorePress={onMorePress}
        onPress={onPress}
        subtitle="Autor fictício"
        title="Caminho da Serra"
      />,
    );

    expect(collectText(renderer.toJSON())).toContain("Caminho da Serra");
    expect(collectText(renderer.toJSON())).toContain("Cebolão em Ré");
    expect(collectText(renderer.toJSON())).toContain("Cururu");
    expect(collectText(renderer.toJSON())).toContain("Fácil");

    act(() => {
      findPressableByLabel(renderer, "Remover Caminho da Serra dos favoritos")?.props.onPress?.();
      findPressableByLabel(renderer, "Mais opções para Caminho da Serra")?.props.onPress?.();
    });

    expect(onFavoritePress).toHaveBeenCalledTimes(1);
    expect(onMorePress).toHaveBeenCalledTimes(1);
  });

  it("SongHeader expõe título, afinação ativa e ações rápidas", () => {
    const onBackPress = vi.fn();
    const onMorePress = vi.fn();
    const onFavoritePress = vi.fn();
    const onTuningPress = vi.fn();

    const { renderer } = renderWithTheme(
      <SongHeader
        activeTuningDetail="Afinação recomendada"
        activeTuningValue="Cebolão em Ré"
        badges={[
          { label: "Compatível", selected: true, variant: "status" },
          { label: "Cururu · 72 BPM", variant: "selection" },
        ]}
        favorite
        onActiveTuningPress={onTuningPress}
        onBackPress={onBackPress}
        onFavoritePress={onFavoritePress}
        onMorePress={onMorePress}
        subtitle="Composição original"
        title="Caminho da Serra"
      />,
    );

    expect(collectText(renderer.toJSON())).toContain("Caminho da Serra");
    expect(collectText(renderer.toJSON())).toContain("Compatível");
    expect(collectText(renderer.toJSON())).toContain("Cebolão em Ré");

    act(() => {
      findPressableByLabel(renderer, "Voltar de Caminho da Serra")?.props.onPress?.();
      findPressableByLabel(renderer, "Mais opções para Caminho da Serra")?.props.onPress?.();
      findPressableByLabel(renderer, "Remover Caminho da Serra dos favoritos")?.props.onPress?.();
      findPressableByLabel(renderer, "Abrir afinações. Cebolão em Ré")?.props.onPress?.();
    });

    expect(onBackPress).toHaveBeenCalledTimes(1);
    expect(onMorePress).toHaveBeenCalledTimes(1);
    expect(onFavoritePress).toHaveBeenCalledTimes(1);
    expect(onTuningPress).toHaveBeenCalledTimes(1);
  });

  it("TransposeControl mostra o tom atual e dispara as mudanças", () => {
    const onDecrease = vi.fn();
    const onIncrease = vi.fn();

    const { renderer } = renderWithTheme(
      <TransposeControl
        currentKeyLabel="D maior"
        helperText="Tom original: C maior"
        onDecrease={onDecrease}
        onIncrease={onIncrease}
        originalKeyLabel="C maior"
      />,
    );

    expect(collectText(renderer.toJSON())).toContain("D maior");
    expect(collectText(renderer.toJSON())).toContain("Tom original: C maior");

    act(() => {
      findPressableByLabel(renderer, "Diminuir tom")?.props.onPress?.();
      findPressableByLabel(renderer, "Aumentar tom")?.props.onPress?.();
    });

    expect(onDecrease).toHaveBeenCalledTimes(1);
    expect(onIncrease).toHaveBeenCalledTimes(1);
  });

  it("ChordLine preserva segmentos e transposição por callback", () => {
    const onChordPress = vi.fn();
    const line = createSongLine();

    const { renderer } = renderWithTheme(
      <ChordLine
        line={line}
        onChordPress={onChordPress}
        resolveChordLabel={(chord) => `PC ${chord.rootPitchClass}`}
        transposeSemitones={2}
      />,
    );

    expect(collectText(renderer.toJSON())).toContain("PC 4");
    expect(collectText(renderer.toJSON())).toContain("PC 11");
    expect(collectText(renderer.toJSON())).toContain("No caminho da serra");

    act(() => {
      findPressableByLabel(renderer, "Abrir acorde PC 4")?.props.onPress?.();
    });

    expect(onChordPress).toHaveBeenCalledTimes(1);
    const payload = onChordPress.mock.calls[0]?.[0] as
      | {
          readonly label: string;
          readonly chord: {
            readonly rootPitchClass: number;
          };
        }
      | undefined;

    expect(payload).toBeTruthy();
    expect(payload?.label).toBe("PC 4");
    expect(payload?.chord.rootPitchClass).toBe(4);
  });

  it("SongSection encadeia a linha e mantém a interação do acorde", () => {
    const onChordPress = vi.fn();
    const section = createSongSection();

    const { renderer } = renderWithTheme(
      <SongSection
        onChordPress={onChordPress}
        resolveChordLabel={(chord) => `PC ${chord.rootPitchClass}`}
        section={section}
        transposeSemitones={2}
      />,
    );

    expect(collectText(renderer.toJSON())).toContain("VERSO 1");
    expect(collectText(renderer.toJSON())).toContain("2x");
    expect(collectText(renderer.toJSON())).toContain("PC 4");

    act(() => {
      findPressableByLabel(renderer, "Abrir acorde PC 4")?.props.onPress?.();
    });

    expect(onChordPress).toHaveBeenCalledTimes(1);
  });

  it("AutoScrollControl mostra velocidade e aciona todas as ações de palco", () => {
    const onDecreaseTextSize = vi.fn();
    const onSpeedPress = vi.fn();
    const onTogglePlayback = vi.fn();
    const onIncreaseTextSize = vi.fn();
    const onSettingsPress = vi.fn();

    const { renderer } = renderWithTheme(
      <AutoScrollControl
        onDecreaseTextSize={onDecreaseTextSize}
        onIncreaseTextSize={onIncreaseTextSize}
        onSettingsPress={onSettingsPress}
        onSpeedPress={onSpeedPress}
        onTogglePlayback={onTogglePlayback}
        running
        speedLabel="0.8×"
      />,
    );

    expect(collectText(renderer.toJSON())).toContain("0.8×");

    act(() => {
      findPressableByLabel(renderer, "Diminuir texto")?.props.onPress?.();
      findPressableByLabel(renderer, "Ajustar velocidade 0.8×")?.props.onPress?.();
      findPressableByLabel(renderer, "Pausar rolagem automática")?.props.onPress?.();
      findPressableByLabel(renderer, "Aumentar texto")?.props.onPress?.();
      findPressableByLabel(renderer, "Abrir ajustes do palco")?.props.onPress?.();
    });

    expect(onDecreaseTextSize).toHaveBeenCalledTimes(1);
    expect(onSpeedPress).toHaveBeenCalledTimes(1);
    expect(onTogglePlayback).toHaveBeenCalledTimes(1);
    expect(onIncreaseTextSize).toHaveBeenCalledTimes(1);
    expect(onSettingsPress).toHaveBeenCalledTimes(1);
  });

  it("ChordPreviewSheet resume métrica, prévia e ações de revisão", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    const onSecondaryPress = vi.fn();

    const { renderer } = renderWithTheme(
      <ChordPreviewSheet
        children={<Text>Prévia estruturada</Text>}
        confirmLabel="Salvar rascunho"
        metrics={[
          { label: "Acordes reconhecidos", value: "4" },
          { label: "Possíveis seções", value: "2" },
          { label: "Avisos", value: "1 revisar", variant: "note" },
        ]}
        note="Conteúdo local apenas."
        onClose={onClose}
        onConfirm={onConfirm}
        onSecondaryPress={onSecondaryPress}
        secondaryLabel="Voltar"
        subtitle="Prévia antes de salvar"
        title="Nova cifra"
        visible
      />,
    );

    expect(collectText(renderer.toJSON())).toContain("Nova cifra");
    expect(collectText(renderer.toJSON())).toContain("Acordes reconhecidos");
    expect(collectText(renderer.toJSON())).toContain("Prévia estruturada");
    expect(collectText(renderer.toJSON())).toContain("Conteúdo local apenas.");

    act(() => {
      findPressableByLabel(renderer, "Voltar")?.props.onPress?.();
      findPressableByLabel(renderer, "Salvar rascunho")?.props.onPress?.();
    });

    expect(onSecondaryPress).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });
});
