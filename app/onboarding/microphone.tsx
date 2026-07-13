import { CircleSymbol, OnboardingScaffold } from "@/components/onboarding";
import { APP_ROUTES } from "@/constants/routes";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useToast } from "@/state/toast";
import { requestRecordingPermissionsAsync } from "expo-audio";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function OnboardingMicrophoneScreen() {
  const { theme } = useAppTheme();
  const onboarding = useOnboarding();
  const { showToast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const advance = async (requestPermission: boolean) => {
    setSaving(true);
    let microphoneStatus = onboarding.snapshot?.draft.microphoneStatus ?? "not_requested";
    try {
      if (requestPermission) {
        try {
          const permission = await requestRecordingPermissionsAsync();
          microphoneStatus = permission.granted ? "granted" : permission.canAskAgain ? "denied" : "blocked";
          showToast({
            title: permission.granted ? "Microfone permitido" : "Você pode continuar sem microfone",
            description: permission.granted
              ? "A permissão será usada somente quando você iniciar o afinador."
              : "Os sons de referência continuam disponíveis.",
            variant: permission.granted ? "success" : "info",
          });
        } catch {
          microphoneStatus = "blocked";
          showToast({
            title: "Não foi possível solicitar a permissão",
            description: "Você pode continuar e tentar novamente no afinador.",
            variant: "warning",
          });
        }
      }
      await onboarding.saveStep({ microphoneStatus }, "summary");
      router.push(APP_ROUTES.onboardingSummary);
    } catch {
      // O gate exibe a recuperação se a persistência local falhar.
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingScaffold
      headerTitle="Afinador"
      step={6}
      onBackPress={() => router.back()}
      primaryLabel="Testar o afinador"
      primaryLoading={saving}
      onPrimaryPress={() => void advance(true)}
      secondaryLabel="Agora não"
      onSecondaryPress={() => void advance(false)}
    >
      <CircleSymbol><Text style={[styles.mic, { color: theme.colors.textPrimary }]}>♩</Text></CircleSymbol>
      <Text style={[theme.typography.displayMedium, styles.center, { color: theme.colors.primaryPressed, marginTop: theme.spacing[6] }]}>O afinador ouve somente enquanto você usa.</Text>
      <Text style={[theme.typography.bodyLarge, styles.center, { color: theme.colors.textSecondary, marginTop: theme.spacing[3] }]}>O som é analisado no aparelho. O app não grava nem envia o áudio.</Text>
      <View style={[styles.info, { backgroundColor: theme.colors.backgroundSubtle, borderColor: theme.colors.border, borderRadius: theme.radii.lg, marginTop: theme.spacing[6], padding: theme.spacing[4] }]}>
        <Text style={[theme.typography.titleMedium, { color: theme.colors.textPrimary }]}>▣ Privacidade local</Text>
        <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary, marginTop: theme.spacing[2] }]}>Você poderá continuar usando sons de referência mesmo sem permitir o microfone.</Text>
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({ center: { textAlign: "center" }, mic: { fontSize: 58 }, info: { width: "100%", borderWidth: 1 } });
