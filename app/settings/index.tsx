import { APP_ROUTES } from "@/constants/routes";
import { useAppTheme } from "@/hooks/useAppTheme";
import { usePreferences } from "@/hooks/usePreferences";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useTunings } from "@/hooks/useTunings";
import { AppButton, AppCard, AppHeader, Chip, ErrorState, LoadingState, ScreenContainer } from "@/components/ui";
import { StyleSheet, Text, View } from "react-native";

const themeOptions = [
  { value: "system" as const, label: "Sistema" },
  { value: "light" as const, label: "Claro" },
  { value: "dark" as const, label: "Escuro" },
];

export default function SettingsScreen() {
  const navigation = useSafeNavigation();
  const { theme, mode, setMode } = useAppTheme();
  const preferencesState = usePreferences();
  const tuningsState = useTunings();
  const activeTuning = tuningsState.tunings.find((tuning) => tuning.isActive);

  const selectTheme = (nextMode: (typeof themeOptions)[number]["value"]) => {
    setMode(nextMode);
    if (preferencesState.preferences) {
      void preferencesState.save({
        ...preferencesState.preferences,
        appearance: { ...preferencesState.preferences.appearance, themeMode: nextMode },
      });
    }
  };

  if (preferencesState.status === "loading") {
    return <ScreenContainer variant="centered"><LoadingState title="Carregando configurações" /></ScreenContainer>;
  }

  return (
    <ScreenContainer scroll background="default">
      <AppHeader title="Configurações" subtitle="Ajustes de aparência, áudio e dados locais" onBackPress={() => navigation.safeBack(APP_ROUTES.home)} />
      {preferencesState.status === "error" ? <ErrorState title="Preferências indisponíveis" description="Não foi possível carregar os ajustes locais." details={preferencesState.error?.message} onActionPress={() => void preferencesState.refresh()} /> : null}
      <AppCard variant="informative" padding="lg" title="Aparência" subtitle="Tema aplicado imediatamente" description="A escolha fica salva no perfil local quando as preferências estão disponíveis.">
        <View style={styles.chipRow}>{themeOptions.map((option) => <Chip key={option.value} label={option.label} selected={mode === option.value} variant="selection" onPress={() => selectTheme(option.value)} />)}</View>
      </AppCard>
      <AppCard variant="music" padding="lg" title="Música e diagramas" subtitle="Contexto atual do estudo" description={activeTuning ? `${activeTuning.name} • ${activeTuning.courseLabels.length} ordens` : "Nenhuma afinação ativa no banco local."} footer={<AppButton fullWidth variant="secondary" onPress={() => navigation.push(APP_ROUTES.tunings)}>Revisar afinações</AppButton>} />
      <AppCard variant="informative" padding="lg" title="Afinador" subtitle="Calibração e tolerância" description={preferencesState.preferences ? `A4 = ${preferencesState.preferences.tuner.calibrationA4} Hz • ±${preferencesState.preferences.tuner.toleranceCents} cents` : "Preferências ainda não disponíveis."} footer={<AppButton fullWidth variant="secondary" onPress={() => navigation.push(APP_ROUTES.tuner)}>Abrir afinador</AppButton>} />
      <AppCard variant="informative" padding="lg" title="Armazenamento" subtitle="Dados pessoais no aparelho" description="Cifras próprias, favoritos, histórico e preferências permanecem locais." footer={<AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.settingsBackup)} variant="primary">Abrir backup local</AppButton>} />
      <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>O catálogo oficial não é incluído no backup pessoal.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 } });
