import { ChordDiagram } from "@/components/chords/ChordDiagram";
import { OnboardingOptionCard, OnboardingScaffold } from "@/components/onboarding";
import { APP_ROUTES } from "@/constants/routes";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboarding } from "@/hooks/useOnboarding";
import type {
  ChordShapeDetails,
  DiagramMode,
  PhysicalStringNumber,
  TuningCourseNumber,
  TuningStringInCourse,
} from "@/types/music";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const previewShape: ChordShapeDetails = {
  id: "onboarding-preview",
  origin: "catalog",
  chord: { rootPitchClass: 2, qualityId: "major", bassPitchClass: null },
  tuning: { type: "tuning", origin: "catalog", id: "onboarding-preview" },
  positions: Array.from({ length: 10 }, (_, index) => {
    const courseNumber = Math.floor(index / 2) + 1;
    const fretByCourse = [0, 2, 3, 2, 0] as const;
    const fret = fretByCourse[courseNumber - 1] ?? 0;
    return {
      physicalStringNumber: (index + 1) as PhysicalStringNumber,
      courseNumber: courseNumber as TuningCourseNumber,
      stringInCourse: ((index % 2) + 1) as TuningStringInCourse,
      fret,
      finger: fret === 2 ? "2" as const : fret === 3 ? "3" as const : null,
      pitchClass: null,
      octave: null,
      intervalLabel: null,
    };
  }),
  barres: [],
  difficulty: "easy",
  verificationStatus: "calculated",
  isRecommended: true,
};

const options: readonly { value: DiagramMode; title: string; description: string }[] = [
  { value: "five_courses", title: "Cinco ordens", description: "Mostra cada par como uma unidade. Mais simples para começar." },
  { value: "ten_strings", title: "Dez cordas", description: "Detalha cada corda e suas oitavas." },
];

export default function OnboardingDiagramScreen() {
  const { theme } = useAppTheme();
  const onboarding = useOnboarding();
  const router = useRouter();
  const [value, setValue] = useState<DiagramMode>(onboarding.snapshot?.draft.diagramMode ?? "five_courses");
  const [saving, setSaving] = useState(false);

  const next = async () => {
    setSaving(true);
    try {
      await onboarding.saveStep({ diagramMode: value }, "handedness");
      router.push(APP_ROUTES.onboardingHandedness);
    } catch {
      // O gate exibe a recuperação sem avançar a rota.
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingScaffold headerTitle="Diagramas" step={4} onBackPress={() => router.back()} primaryLabel="Continuar" primaryLoading={saving} onPrimaryPress={() => void next()}>
      <Text style={[theme.typography.displayMedium, { color: theme.colors.primaryPressed }]}>Como prefere visualizar os acordes?</Text>
      <Text style={[theme.typography.bodyLarge, { color: theme.colors.textSecondary, marginTop: theme.spacing[2] }]}>A opção pode ser alterada depois em qualquer acorde.</Text>
      <View accessibilityRole="radiogroup" style={[styles.options, { gap: theme.spacing[3], marginTop: theme.spacing[6] }]}>
        {options.map((option) => (
          <OnboardingOptionCard key={option.value} title={option.title} description={option.description} selected={value === option.value} onPress={() => setValue(option.value)}>
            {value === option.value ? (
              <ChordDiagram
                shape={previewShape}
                mode={option.value}
                density="compact"
                showNotes={false}
                showIntervals={false}
                accessibilityLabel={`Prévia ilustrativa de acorde em ${option.title.toLowerCase()}`}
              />
            ) : null}
          </OnboardingOptionCard>
        ))}
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({ options: { width: "100%" } });
