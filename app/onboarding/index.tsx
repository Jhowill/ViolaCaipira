import { OnboardingProgress, OnboardingScaffold, ViolaHero } from "@/components/onboarding";
import { APP_ROUTES } from "@/constants/routes";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function OnboardingWelcomeScreen() {
  const { theme } = useAppTheme();
  const onboarding = useOnboarding();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const start = async () => {
    setSaving(true);
    try {
      await onboarding.saveStep({}, "experience");
      router.push(APP_ROUTES.onboardingExperience);
    } catch {
      // O gate exibe a recuperação sem avançar a rota.
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingScaffold primaryLabel="Começar" primaryLoading={saving} onPrimaryPress={() => void start()}>
      <OnboardingProgress step={1} />
      <ViolaHero />
      <View style={styles.copy}>
        <Text style={[theme.typography.displayLarge, { color: theme.colors.primaryPressed }]}>
          Sua viola, sua afinação, seu repertório.
        </Text>
        <Text style={[theme.typography.bodyLarge, { color: theme.colors.textSecondary, marginTop: theme.spacing[3] }]}>
          Acordes, cifras, batidas e afinador para viola de 10 cordas, disponíveis mesmo sem internet.
        </Text>
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({ copy: { width: "100%", marginTop: 16 } });
