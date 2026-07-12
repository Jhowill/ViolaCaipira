import { AppThemeContext } from "@/theme/context";
import { resolveTheme } from "@/theme/themes";
import type { AppThemeContextValue, ThemeMode } from "@/types/theme";
import {
  BottomSheet,
  Dialog,
  OfflineBadge,
  SearchField,
  SelectField,
  TextField,
} from "@/components/ui";
import { ToastProvider, useToast } from "@/state/toast";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  type ScaledSize,
} from "react-native";
import TestRenderer, { act, type ReactTestRendererJSON } from "react-test-renderer";

type PressableNode = {
  readonly props: {
    readonly accessibilityLabel?: string;
    readonly accessibilityState?: {
      readonly disabled?: boolean;
      readonly selected?: boolean;
    };
    readonly onPress?: () => void;
  };
};

type TextInputNode = {
  readonly props: {
    readonly accessibilityLabel?: string;
    readonly editable?: boolean;
    readonly returnKeyType?: string;
    readonly onChangeText?: (value: string) => void;
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

function findPressableByLabel(renderer: ReturnType<typeof TestRenderer.create>, label: string) {
  const pressables = renderer.root.findAllByType(Pressable) as unknown as PressableNode[];
  return pressables.find((instance) => instance.props.accessibilityLabel === label);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("UI form controls e overlays", () => {
  it("TextField mostra label, helper, erro e contador", () => {
    const onChangeText = vi.fn();
    const { renderer } = renderWithTheme(
      <TextField
        clearable
        counter={{ maximum: 40 }}
        errorText="Título obrigatório"
        helperText="Use um nome claro"
        label="Título"
        onChangeText={onChangeText}
        value="Moda das Dez Cordas"
      />,
    );

    const input = renderer.root.findByType(TextInput) as unknown as TextInputNode;
    expect(input.props.accessibilityLabel).toBe("Título");
    expect(input.props.editable).toBe(true);

    act(() => {
      input.props.onChangeText?.("Moda nova");
    });

    expect(onChangeText).toHaveBeenCalledWith("Moda nova");
    expect(collectText(renderer.toJSON())).toContain("Título obrigatório");
    expect(collectText(renderer.toJSON())).toContain("caracteres");

    const clearButton = findPressableByLabel(renderer, "Limpar campo");
    expect(clearButton).toBeTruthy();

    act(() => {
      clearButton?.props.onPress?.();
    });

    expect(onChangeText).toHaveBeenCalledWith("");
  });

  it("SearchField dispara limpar e filtros", () => {
    const onChangeText = vi.fn();
    const onClearPress = vi.fn();
    const onFilterPress = vi.fn();

    const { renderer } = renderWithTheme(
      <SearchField
        accessibilityLabel="Buscar cifras"
        onChangeText={onChangeText}
        onClearPress={onClearPress}
        onFilterPress={onFilterPress}
        value="D maior"
      />,
    );

    const searchInput = renderer.root.findByType(TextInput) as unknown as TextInputNode;
    expect(searchInput.props.returnKeyType).toBe("search");

    const clearButton = findPressableByLabel(renderer, "Limpar busca");
    const filterButton = findPressableByLabel(renderer, "Filtros");

    expect(clearButton).toBeTruthy();
    expect(filterButton).toBeTruthy();

    act(() => {
      clearButton?.props.onPress?.();
      filterButton?.props.onPress?.();
    });

    expect(onClearPress).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenCalledWith("");
    expect(onFilterPress).toHaveBeenCalledTimes(1);
  });

  it("SelectField abre bottom sheet no celular e atualiza o valor", () => {
    const mobileWindow: ScaledSize = {
      width: 390,
      height: 844,
      scale: 1,
      fontScale: 1,
    };

    vi.spyOn(Dimensions, "get").mockReturnValue(mobileWindow);

    function SelectHarness() {
      const [value, setValue] = useState<"D" | "E">("D");

      return (
        <SelectField
          label="Tom"
          onValueChange={setValue}
          options={[
            { label: "D maior", value: "D" },
            { label: "E menor", value: "E" },
          ]}
          value={value}
        />
      );
    }

    const { renderer } = renderWithTheme(
      <SelectHarness />,
    );

    expect(renderer.root.findAllByType(BottomSheet)).toHaveLength(1);

    const field = findPressableByLabel(renderer, "Tom, D maior");
    expect(field).toBeTruthy();

    act(() => {
      field?.props.onPress?.();
    });

    expect(renderer.root.findAllByType(Modal)).toHaveLength(1);
    expect(collectText(renderer.toJSON())).toContain("E menor");

    const option = findPressableByLabel(renderer, "E menor");
    expect(option).toBeTruthy();

    act(() => {
      option?.props.onPress?.();
    });

    expect(renderer.root.findAllByType(BottomSheet)).toHaveLength(1);
    expect(collectText(renderer.toJSON())).toContain("E menor");
  });

  it("SelectField usa diálogo no tablet", () => {
    const tabletWindow: ScaledSize = {
      width: 900,
      height: 1200,
      scale: 2,
      fontScale: 2,
    };

    vi.spyOn(Dimensions, "get").mockReturnValue(tabletWindow);

    const { renderer } = renderWithTheme(
      <SelectField
        label="Afinação"
        onValueChange={vi.fn()}
        options={[{ label: "Cebolão em Ré", value: "D" }]}
        value={null}
      />,
    );

    expect(renderer.root.findAllByType(Dialog)).toHaveLength(1);
    expect(renderer.root.findAllByType(BottomSheet)).toHaveLength(0);
  });

  it("BottomSheet protege o fechamento quando desativado", () => {
    const onClose = vi.fn();

    const { renderer } = renderWithTheme(
      <BottomSheet onClose={onClose} title="Filtrar" visible dismissible={false}>
        <Text>Conteúdo</Text>
      </BottomSheet>,
    );

    const closeButton = findPressableByLabel(renderer, "Fechar");
    expect(closeButton?.props.accessibilityState).toMatchObject({
      disabled: true,
    });

    act(() => {
      closeButton?.props.onPress?.();
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("Dialog dispara ações primária e secundária", () => {
    const onCancel = vi.fn();
    const onDelete = vi.fn();
    const onClose = vi.fn();

    const { renderer } = renderWithTheme(
      <Dialog
        actions={[
          { label: "Cancelar", onPress: onCancel, variant: "secondary" },
          { label: "Excluir", onPress: onDelete, variant: "destructive" },
        ]}
        description="Esta ação não pode ser desfeita."
        onClose={onClose}
        title="Apagar cifra"
        visible
      />,
    );

    expect(collectText(renderer.toJSON())).toContain("Apagar cifra");
    expect(collectText(renderer.toJSON())).toContain("Esta ação não pode ser desfeita.");

    act(() => {
      findPressableByLabel(renderer, "Cancelar")?.props.onPress?.();
      findPressableByLabel(renderer, "Excluir")?.props.onPress?.();
      findPressableByLabel(renderer, "Fechar")?.props.onPress?.();
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ToastProvider mostra toast e desfaz ação", () => {
    const onUndo = vi.fn();

    function ToastHarness() {
      const { showToast } = useToast();

      return (
        <View>
          <Pressable
            accessibilityLabel="Mostrar toast"
            onPress={() =>
              showToast({
                title: "Cifra salva",
                description: "Alteração guardada neste aparelho",
                actionLabel: "Desfazer",
                onActionPress: onUndo,
                variant: "success",
                durationMs: 10_000,
              })
            }
          >
            <Text>Mostrar</Text>
          </Pressable>
        </View>
      );
    }

    const { renderer } = renderWithTheme(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    act(() => {
      findPressableByLabel(renderer, "Mostrar toast")?.props.onPress?.();
    });

    expect(collectText(renderer.toJSON())).toContain("Cifra salva");

    act(() => {
      findPressableByLabel(renderer, "Desfazer")?.props.onPress?.();
    });

    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(collectText(renderer.toJSON())).not.toContain("Cifra salva");
  });

  it("OfflineBadge mostra conteúdo quando visível e some quando oculto", () => {
    const visibleRenderer = renderWithTheme(
      <OfflineBadge description="Conteúdo disponível sem internet" label="Disponível offline" />,
    ).renderer;

    expect(collectText(visibleRenderer.toJSON())).toContain("Disponível offline");
    expect(collectText(visibleRenderer.toJSON())).toContain("Conteúdo disponível sem internet");

    const hiddenRenderer = renderWithTheme(<OfflineBadge visible={false} />).renderer;
    expect(hiddenRenderer.toJSON()).toBeNull();
  });
});
