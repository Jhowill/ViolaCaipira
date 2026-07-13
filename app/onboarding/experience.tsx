import { OnboardingOptionCard, OnboardingScaffold } from "@/components/onboarding";
import { APP_ROUTES } from "@/constants/routes";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboarding } from "@/hooks/useOnboarding";
import type { UserProfile } from "@/types/music";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const options: readonly { value: UserProfile["experienceLevel"]; title: string; description: string }[] = [
  { value: "beginner", title: "Estou começando", description: "Explicações simples, cinco ordens e primeiros acordes." },
  { value: "intermediate", title: "Já toco algumas músicas", description: "Transposição, variações de acordes e ritmos completos." },
  { value: "advanced", title: "Tenho experiência com viola", description: "Dez cordas, detalhes técnicos e criação rápida." },
];

export default function OnboardingExperienceScreen() {
  const { theme } = useAppTheme();
  const onboarding = useOnboarding();
  const router = useRouter();
  const [value, setValue] = useState(onboarding.snapshot?.draft.experienceLevel ?? "beginner");
  const [saving, setSaving] = useState(false);

  const next = async () => {
    setSaving(true);
    try {
      await onboarding.saveStep({ experienceLevel: value }, "tuning");
      router.push(APP_ROUTES.onboardingTuning);
    } catch {
      // O gate exibe a recuperação sem avançar a rota.
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingScaffold
      headerTitle="Seu nível"
      step={2}
      onBackPress={() => router.back()}
      primaryLabel="Continuar"
      primaryLoading={saving}
      onPrimaryPress={() => void next()}
    >
      <Text style={[theme.typography.displayMedium, { color: theme.colors.primaryPressed }]}>Como está sua experiência com viola?</Text>
      <Text style={[theme.typography.bodyLarge, { color: theme.colors.textSecondary, marginTop: theme.spacing[2] }]}>Isso ajusta as sugestões iniciais, sem bloquear nenhum recurso.</Text>
      <View accessibilityRole="radiogroup" style={[styles.options, { gap: theme.spacing[3], marginTop: theme.spacing[6] }]}>
        {options.map((option) => (
          <OnboardingOptionCard
            key={option.value}
            title={option.title}
            description={option.description}
            selected={value === option.value}
            onPress={() => setValue(option.value)}
          />
        ))}
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({ options: { width: "100%" } });
