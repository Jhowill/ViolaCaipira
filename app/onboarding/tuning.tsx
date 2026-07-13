import { OnboardingOptionCard, OnboardingScaffold } from "@/components/onboarding";
import { APP_ROUTES } from "@/constants/routes";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboarding } from "@/hooks/useOnboarding";
import type { OnboardingTuningChoice } from "@/repositories/onboardingRepository";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const options: readonly { value: OnboardingTuningChoice; badge: string; title: string; description: string }[] = [
  { value: "cebolao-re", badge: "D", title: "Cebolão em Ré", description: "Muito usada e indicada para começar." },
  { value: "cebolao-mi", badge: "E", title: "Cebolão em Mi", description: "Alternativa tradicional em registro mais alto." },
  { value: "rio-abaixo", badge: "G", title: "Rio Abaixo", description: "Afinação tradicional com sonoridade aberta." },
  { value: "boiadeira", badge: "B", title: "Boiadeira", description: "Outra opção tradicional para seu repertório." },
  { value: "unknown", badge: "?", title: "Não sei qual uso", description: "Use uma escolha provisória e revise depois." },
];

export default function OnboardingTuningScreen() {
  const { theme } = useAppTheme();
  const onboarding = useOnboarding();
  const router = useRouter();
  const [value, setValue] = useState<OnboardingTuningChoice>(onboarding.snapshot?.draft.tuningChoice ?? "cebolao-re");
  const [saving, setSaving] = useState(false);

  const next = async () => {
    setSaving(true);
    try {
      await onboarding.saveStep({ tuningChoice: value }, "diagram");
      router.push(APP_ROUTES.onboardingDiagram);
    } catch {
      // O gate exibe a recuperação sem avançar a rota.
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingScaffold headerTitle="Afinação inicial" step={3} onBackPress={() => router.back()} primaryLabel="Confirmar afinação" primaryLoading={saving} onPrimaryPress={() => void next()}>
      <Text style={[theme.typography.displayMedium, { color: theme.colors.primaryPressed }]}>Qual afinação você usa?</Text>
      <Text style={[theme.typography.bodyLarge, { color: theme.colors.textSecondary, marginTop: theme.spacing[2] }]}>Todo acorde e cifra será ajustado à afinação ativa.</Text>
      <View accessibilityRole="radiogroup" style={[styles.options, { gap: theme.spacing[3], marginTop: theme.spacing[6] }]}>
        {options.map((option) => (
          <OnboardingOptionCard
            key={option.value}
            title={option.title}
            description={option.description}
            icon={<Text style={[theme.typography.headlineMedium, { color: theme.colors.primary }]}>{option.badge}</Text>}
            selected={value === option.value}
            onPress={() => setValue(option.value)}
          />
        ))}
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({ options: { width: "100%" } });
