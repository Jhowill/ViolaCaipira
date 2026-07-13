import { OnboardingOptionCard, OnboardingScaffold } from "@/components/onboarding";
import { APP_ROUTES } from "@/constants/routes";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboarding } from "@/hooks/useOnboarding";
import type { Handedness } from "@/types/music";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const options: readonly { value: Handedness; icon: string; title: string; description: string }[] = [
  { value: "right", icon: "↘", title: "Destro", description: "Movimentos de batida orientados para a mão direita." },
  { value: "left", icon: "↙", title: "Canhoto", description: "Conteúdo musical espelhado quando necessário." },
];

export default function OnboardingHandednessScreen() {
  const { theme } = useAppTheme();
  const onboarding = useOnboarding();
  const router = useRouter();
  const [value, setValue] = useState<Handedness>(onboarding.snapshot?.draft.handedness ?? "right");
  const [saving, setSaving] = useState(false);

  const next = async () => {
    setSaving(true);
    try {
      await onboarding.saveStep({ handedness: value }, "microphone");
      router.push(APP_ROUTES.onboardingMicrophone);
    } catch {
      // O gate exibe a recuperação sem avançar a rota.
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingScaffold headerTitle="Preferência de execução" step={5} onBackPress={() => router.back()} primaryLabel="Continuar" primaryLoading={saving} onPrimaryPress={() => void next()}>
      <Text style={[theme.typography.displayMedium, { color: theme.colors.primaryPressed }]}>Você toca como destro ou canhoto?</Text>
      <Text style={[theme.typography.bodyLarge, { color: theme.colors.textSecondary, marginTop: theme.spacing[2] }]}>Batidas e diagramas aplicáveis serão orientados corretamente.</Text>
      <View accessibilityRole="radiogroup" style={[styles.options, { gap: theme.spacing[3], marginTop: theme.spacing[6] }]}>
        {options.map((option) => (
          <OnboardingOptionCard
            key={option.value}
            title={option.title}
            description={option.description}
            icon={<Text style={[theme.typography.headlineLarge, { color: theme.colors.primary }]}>{option.icon}</Text>}
            selected={value === option.value}
            onPress={() => setValue(option.value)}
          />
        ))}
      </View>
      <View style={[styles.info, { backgroundColor: theme.colors.backgroundSubtle, borderColor: theme.colors.border, borderRadius: theme.radii.lg, marginTop: theme.spacing[5], padding: theme.spacing[4] }]}>
        <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary }]}>ⓘ A navegação do aplicativo não será espelhada. Apenas diagramas e gestos musicais compatíveis.</Text>
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({ options: { width: "100%" }, info: { width: "100%", borderWidth: 1 } });
