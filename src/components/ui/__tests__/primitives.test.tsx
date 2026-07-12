import { AppThemeContext } from "@/theme/context";
import { resolveTheme } from "@/theme/themes";
import type { AppThemeContextValue, ThemeMode } from "@/types/theme";
import {
  AppButton,
  AppCard,
  AppHeader,
  Chip,
  EmptyState,
  ErrorState,
  LoadingState,
  ScreenContainer,
  SegmentedControl,
} from "@/components/ui";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type PressableStateCallbackType,
  type ScaledSize,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TestRenderer, { act, type ReactTestInstance, type ReactTestRendererJSON } from "react-test-renderer";

type PressableNode = {
  readonly props: {
    readonly style: (state: PressableStateCallbackType) => StyleProp<ViewStyle>;
    readonly accessibilityState?: {
      readonly busy?: boolean;
      readonly disabled?: boolean;
      readonly selected?: boolean;
    };
    readonly accessibilityLabel?: string;
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

function renderWithTheme(element: React.ReactElement, mode: ThemeMode = "light", systemColorScheme: "light" | "dark" = "light") {
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

function resolvePressableStyle(instance: PressableNode) {
  const state: PressableStateCallbackType & {
    readonly focused?: boolean;
    readonly hovered?: boolean;
  } = { pressed: false, focused: false, hovered: false };

  const resolvedStyle = instance.props.style(state);

  return StyleSheet.flatten(resolvedStyle);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("UI primitives", () => {
  it("ScreenContainer respeita safe area e aplica largura máxima em tablet", () => {
    const tabletWindow: ScaledSize = {
      width: 900,
      height: 1200,
      scale: 2,
      fontScale: 2,
    };

    vi.spyOn(Dimensions, "get").mockReturnValue(tabletWindow);

    const { renderer, value } = renderWithTheme(
      <ScreenContainer variant="scroll">
        <Text>Conteúdo</Text>
      </ScreenContainer>,
    );

    expect(renderer.root.findAllByType(SafeAreaView)).toHaveLength(1);
    expect(renderer.root.findAllByType(ScrollView)).toHaveLength(1);
    const safeAreaStyle = StyleSheet.flatten(
      (renderer.root.findByType(SafeAreaView).props as { readonly style?: unknown }).style,
    ) as ViewStyle;

    expect(safeAreaStyle.backgroundColor).toBe(value.theme.colors.background);

    const tabletContent = renderer.root.findAllByType(View).find((node: ReactTestInstance) => {
      const style = StyleSheet.flatten((node.props as { readonly style?: unknown }).style) as ViewStyle;
      return style.maxWidth === 720;
    });

    expect(tabletContent).toBeTruthy();
  });

  it.each(["light", "dark", "highContrast"] as const)(
    "AppButton usa o tema %s e preserva o rótulo durante loading",
    (mode) => {
      const systemColorScheme = mode === "highContrast" ? "dark" : "light";
      const { renderer, value } = renderWithTheme(
        <AppButton loading variant="primary">
          Salvar
        </AppButton>,
        mode,
        systemColorScheme,
      );

      const pressable = renderer.root.findByType(Pressable) as unknown as PressableNode;
      const style = resolvePressableStyle(pressable);

      expect(style.backgroundColor).toBe(value.theme.colors.primary);
      expect(style.borderWidth).toBe(value.theme.borderWidth);
      expect(pressable.props.accessibilityState).toMatchObject({
        busy: true,
        disabled: true,
      });
      expect(renderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
      expect(collectText(renderer.toJSON())).toContain("Salvar");
    },
  );

  it("AppCard não parece botão quando estático e ganha borda de destaque no alto contraste", () => {
    const staticRenderer = renderWithTheme(
      <AppCard title="Caminho da Serra" subtitle="Cifra · tom D" />,
    ).renderer;

    expect(staticRenderer.root.findAllByType(Pressable)).toHaveLength(0);

    const { renderer, value } = renderWithTheme(
      <AppCard title="Selecionado" onPress={vi.fn()} selected variant="interactive" />,
      "highContrast",
      "dark",
    );

    const pressable = renderer.root.findByType(Pressable) as unknown as PressableNode;
    const style = resolvePressableStyle(pressable);

    expect(style.borderWidth).toBe(value.theme.borderWidth);
    expect(style.borderColor).toBe(value.theme.colors.primary);
    expect(pressable.props.accessibilityState).toMatchObject({
      selected: true,
    });
  });

  it("AppHeader expõe título, voltar e ações laterais", () => {
    const onBackPress = vi.fn();
    const onActionPress = vi.fn();

    const { renderer } = renderWithTheme(
      <AppHeader
        title="Configurações"
        subtitle="Ajustes gerais"
        onBackPress={onBackPress}
        primaryAction={{
          accessibilityLabel: "Abrir menu",
          icon: <Text>⚙</Text>,
          onPress: onActionPress,
        }}
      />,
    );

    expect(collectText(renderer.toJSON())).toContain("Configurações");
    expect(
      renderer.root
        .findAllByType(Pressable)
        .some((instance) => (instance.props as { readonly accessibilityLabel?: string }).accessibilityLabel === "Voltar"),
    ).toBe(true);
    expect(renderer.root.findAllByType(Pressable)).toHaveLength(2);
  });

  it("Chip e SegmentedControl mantêm seleção e acionam mudanças", () => {
    const onChipPress = vi.fn();
    const onRemovePress = vi.fn();
    const onValueChange = vi.fn();

    const chipRenderer = renderWithTheme(
      <Chip
        label="Cebolão em Ré"
        onPress={onChipPress}
        onRemovePress={onRemovePress}
        removable
        selected
      />,
    ).renderer;

    const chipPressables = chipRenderer.root.findAllByType(Pressable) as unknown as PressableNode[];
    const chipRoot = chipPressables.find((instance) => instance.props.accessibilityLabel === "Cebolão em Ré");
    const removeButton = chipPressables.find((instance) => instance.props.accessibilityLabel === "Remover Cebolão em Ré");

    expect(chipRoot?.props.accessibilityState).toMatchObject({
      selected: true,
    });

    act(() => {
      chipRoot?.props.onPress?.();
    });

    act(() => {
      removeButton?.props.onPress?.({ stopPropagation: () => undefined });
    });

    expect(onChipPress).toHaveBeenCalledTimes(1);
    expect(onRemovePress).toHaveBeenCalledTimes(1);

    const segmentedRenderer = renderWithTheme(
      <SegmentedControl
        accessibilityLabel="Modo de visualização"
        options={[
          { label: "Lista", value: "list" },
          { label: "Grade", value: "grid" },
          { label: "Tudo", value: "all" },
        ]}
        value="grid"
        onValueChange={onValueChange}
      />,
    ).renderer;

    const segments = segmentedRenderer.root.findAllByType(Pressable) as unknown as PressableNode[];
    expect(segments).toHaveLength(3);
    const selectedSegment = segments[1]!;
    const firstSegment = segments[0]!;

    expect(selectedSegment.props.accessibilityState).toMatchObject({
      selected: true,
    });

    act(() => {
      firstSegment.props.onPress?.();
    });

    expect(onValueChange).toHaveBeenCalledWith("list");
  });

  it("LoadingState, EmptyState e ErrorState expõem conteúdo e CTAs básicos", () => {
    const loadingRenderer = renderWithTheme(
      <LoadingState variant="inline" title="Sincronizando" />,
    ).renderer;

    expect(loadingRenderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);

    const emptyRenderer = renderWithTheme(
      <EmptyState
        actionLabel="Criar cifra"
        description="Comece com sua primeira cifra."
        onActionPress={vi.fn()}
        title="Nenhuma cifra ainda"
      />,
    ).renderer;

    expect(collectText(emptyRenderer.toJSON())).toContain("Criar cifra");

    const errorRenderer = renderWithTheme(
      <ErrorState
        description="Não foi possível carregar os dados locais."
        onActionPress={vi.fn()}
        title="Falha ao abrir"
      />,
    ).renderer;

    expect(collectText(errorRenderer.toJSON())).toContain("Tentar novamente");
  });
});
