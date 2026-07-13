import { CircleSymbol, OnboardingScaffold } from "@/components/onboarding";
import { APP_ROUTES } from "@/constants/routes";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const tuningLabels = {
  "cebolao-re": "Cebolão em Ré",
  "cebolao-mi": "Cebolão em Mi",
  "rio-abaixo": "Rio Abaixo",
  boiadeira: "Boiadeira",
  unknown: "Cebolão em Ré (provisória)",
} as const;

export default function OnboardingSummaryScreen() {
  const { theme } = useAppTheme();
  const onboarding = useOnboarding();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const draft = onboarding.snapshot?.draft;

  const finish = async () => {
    setSaving(true);
    try {
      await onboarding.complete();
    } catch {
      // O gate exibe a recuperação sem concluir o fluxo.
    } finally {
      setSaving(false);
    }
  };

  const rows = [
    ["Afinação", tuningLabels[draft?.tuningChoice ?? "cebolao-re"]],
    ["Diagramas", draft?.diagramMode === "ten_strings" ? "Dez cordas" : "Cinco ordens"],
    ["Execução", draft?.handedness === "left" ? "Canhoto" : "Destro"],
    ["Afinador", draft?.microphoneStatus === "granted" ? "Microfone permitido" : "Sem microfone por enquanto"],
  ] as const;

  return (
    <OnboardingScaffold
      headerTitle="Tudo pronto"
      onBackPress={() => router.back()}
      primaryLabel="Entrar no app"
      primaryLoading={saving}
      onPrimaryPress={() => void finish()}
      secondaryLabel="Revisar escolhas"
      onSecondaryPress={() => router.push(APP_ROUTES.onboardingExperience)}
    >
      <CircleSymbol><Text style={[styles.check, { color: theme.colors.textPrimary }]}>✓</Text></CircleSymbol>
      <Text style={[theme.typography.displayMedium, styles.center, { color: theme.colors.primaryPressed, marginTop: theme.spacing[6] }]}>Pronto para tocar.</Text>
      <Text style={[theme.typography.bodyLarge, styles.center, { color: theme.colors.textSecondary, marginTop: theme.spacing[2] }]}>Estas escolhas podem ser alteradas a qualquer momento.</Text>
      <View style={[styles.summary, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radii.lg, marginTop: theme.spacing[6], paddingHorizontal: theme.spacing[4] }]}>
        {rows.map(([label, value], index) => (
          <View key={label} style={[styles.row, { borderBottomColor: theme.colors.divider, borderBottomWidth: index === rows.length - 1 ? 0 : 1, paddingVertical: theme.spacing[4] }]}>
            <Text style={[theme.typography.bodyLarge, { color: theme.colors.textSecondary }]}>{label}</Text>
            <Text style={[theme.typography.titleMedium, styles.value, { color: theme.colors.textPrimary }]}>{value}</Text>
          </View>
        ))}
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({ center: { textAlign: "center" }, check: { fontSize: 64 }, summary: { width: "100%", borderWidth: 1 }, row: { flexDirection: "row", justifyContent: "space-between", gap: 16 }, value: { flex: 1, textAlign: "right" } });
