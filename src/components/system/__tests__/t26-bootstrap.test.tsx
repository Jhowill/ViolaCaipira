import { AppBootstrapContext } from "@/state/appBootstrap/context";
import { AppThemeContext } from "@/theme/context";
import { resolveTheme } from "@/theme/themes";
import type { AppBootstrapContextValue } from "@/types/bootstrap";
import type { ThemeMode } from "@/types/theme";
import { AppBootstrapGate } from "@/components/system/AppBootstrapGate";
import { BootstrapScreen } from "@/screens/system/BootstrapScreen";
import { RecoveryScreen } from "@/screens/system/RecoveryScreen";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pressable, Text } from "react-native";
import TestRenderer, { act } from "react-test-renderer";

let currentPathname = "/";

vi.mock("expo-router", () => ({
  Redirect: ({ href }: { readonly href: string }) => <Text testID="redirect">{href}</Text>,
  usePathname: () => currentPathname,
}));

function createThemeContext(mode: ThemeMode, systemColorScheme: "light" | "dark" = "light") {
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
    renderer = TestRenderer.create(<AppThemeContext.Provider value={value}>{element}</AppThemeContext.Provider>);
  });

  return { renderer: renderer as ReturnType<typeof TestRenderer.create>, value };
}

function createBootstrapValue(overrides: Partial<AppBootstrapContextValue> = {}): AppBootstrapContextValue {
  return {
    phase: "booting",
    attempt: 1,
    error: null,
    retry: vi.fn(() => Promise.resolve()),
    ...overrides,
  };
}

function renderWithBootstrap(element: React.ReactElement, bootstrap: AppBootstrapContextValue) {
  return renderWithTheme(
    <AppBootstrapContext.Provider value={bootstrap}>
      <AppBootstrapGate>{element}</AppBootstrapGate>
    </AppBootstrapContext.Provider>,
  );
}

function collectText(node: unknown): string {
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
    const children = (node as { readonly children?: unknown }).children;
    return collectText(children);
  }

  return "";
}

function findPressableByLabel(renderer: ReturnType<typeof TestRenderer.create>, label: string) {
  return renderer.root
    .findAllByType(Pressable)
    .find((node) => (node.props as { readonly accessibilityLabel?: string }).accessibilityLabel === label);
}

afterEach(() => {
  vi.restoreAllMocks();
  currentPathname = "/";
});

describe("T26 bootstrap flow", () => {
  it("mostra a splash visual com a marca e a nota offline", () => {
    const { renderer } = renderWithTheme(<BootstrapScreen phase="booting" />);

    const text = collectText(renderer.toJSON());

    expect(text).toContain("Cifras de Viola");
    expect(text).toContain("ACORDES · AFINAÇÕES · BATIDAS");
    expect(text).toContain("Conteúdo disponível offline");
  });

  it("expõe a recuperação com detalhes técnicos sem oferecer um modo limitado inseguro", () => {
    const onRetry = vi.fn();
    const { renderer } = renderWithTheme(
      <RecoveryScreen
        fatal={false}
        onRetry={onRetry}
        technicalDetails="MigrationError: different checksum"
      />,
    );

    expect(collectText(renderer.toJSON())).toContain("Não foi possível preparar o conteúdo local.");
    expect(collectText(renderer.toJSON())).not.toContain("Abrir em modo limitado");

    act(() => {
      const technicalButton = findPressableByLabel(renderer, "Ver informações técnicas");
      (technicalButton?.props as { readonly onPress?: () => void })?.onPress?.();
    });

    expect(collectText(renderer.toJSON())).toContain("Informações técnicas");
    expect(collectText(renderer.toJSON())).toContain("MigrationError: different checksum");
  });

  it("mostra a splash do bootstrap enquanto prepara e redireciona para a recuperação quando há erro", () => {
    const booting = createBootstrapValue({ phase: "booting" });

    const bootingRender = renderWithBootstrap(
      <Text>Conteúdo protegido</Text>,
      booting,
    );

    expect(collectText(bootingRender.renderer.toJSON())).toContain("Cifras de Viola");

    currentPathname = "/";
    const error = createBootstrapValue({ phase: "recoverable_error", error: new Error("database locked") });
    const errorRender = renderWithBootstrap(
      <Text>Conteúdo protegido</Text>,
      error,
    );

    expect(collectText(errorRender.renderer.toJSON())).toContain("/error/recovery");
  });

  it("permite a tela de recuperação e volta ao app quando o caminho já é a rota de recuperação", () => {
    currentPathname = "/error/recovery";
    const bootstrap = createBootstrapValue({
      phase: "recoverable_error",
      error: new Error("database locked"),
    });

    const { renderer } = renderWithBootstrap(<Text>Conteúdo protegido</Text>, bootstrap);

    expect(collectText(renderer.toJSON())).toContain("Conteúdo protegido");
  });

  it("redireciona para o app quando a recuperação é concluída e o usuário está na rota de recuperação", () => {
    currentPathname = "/error/recovery";
    const bootstrap = createBootstrapValue({ phase: "ready" });

    const { renderer } = renderWithBootstrap(<Text>Conteúdo protegido</Text>, bootstrap);

    expect(collectText(renderer.toJSON())).toContain("/(tabs)");
  });
});
