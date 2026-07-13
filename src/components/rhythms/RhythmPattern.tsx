import { AppCard, Chip } from "@/components/ui";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { RhythmPatternView, RhythmStepView } from "@/repositories/rhythmRepository";
import { StyleSheet, Text, View } from "react-native";
import { RhythmStep, type RhythmStepState } from "@/components/rhythms/RhythmStep";

export interface RhythmPatternProps {
  readonly pattern: RhythmPatternView;
  readonly title?: string;
  readonly description?: string;
  readonly leftHanded?: boolean;
  readonly compact?: boolean;
  readonly showHeader?: boolean;
  readonly showLegend?: boolean;
  readonly currentStepIndex?: number | null;
  readonly currentStepId?: string | null;
  readonly onStepPress?: (step: RhythmStepView, index: number) => void;
  readonly accessibilityLabel?: string;
}

function resolveDifficultyLabel(level: RhythmPatternView["level"]): string {
  switch (level) {
    case "beginner":
      return "Iniciante";
    case "easy":
      return "Fácil";
    case "intermediate":
      return "Intermediário";
    case "advanced":
    default:
      return "Avançado";
  }
}

function resolveHandModeLabel(handMode: RhythmPatternView["handMode"], leftHanded: boolean): string {
  if (leftHanded) {
    return "Canhoto";
  }

  return handMode === "right_hand_reference" ? "Referência" : "Destro";
}

function resolveStepState(
  step: RhythmStepView,
  index: number,
  currentStepIndex: number | null | undefined,
  currentStepId: string | null | undefined,
): RhythmStepState {
  if (currentStepId && step.id === currentStepId) {
    return "current";
  }

  if (typeof currentStepIndex === "number" && index === currentStepIndex) {
    return "current";
  }

  if (step.action === "rest") {
    return "pause";
  }

  if (step.isAccent) {
    return "accented";
  }

  return "future";
}

function buildLegend() {
  return [
    "↓ para baixo",
    "↑ para cima",
    "× abafamento",
    "— pausa",
  ];
}

export function RhythmPattern({
  pattern,
  title,
  description,
  leftHanded = false,
  compact = false,
  showHeader = true,
  showLegend = true,
  currentStepIndex = null,
  currentStepId = null,
  onStepPress,
  accessibilityLabel,
}: RhythmPatternProps) {
  const { theme } = useAppTheme();
  const displaySteps = leftHanded ? [...pattern.steps].slice().reverse() : pattern.steps;
  const patternTitle = title ?? pattern.name;
  const patternDescription = description ?? pattern.notes ?? undefined;
  const accessibilitySummary = [
    patternTitle,
    pattern.bars ? `${pattern.bars} compassos` : null,
    `${pattern.steps.length} passos`,
    resolveDifficultyLabel(pattern.level),
    resolveHandModeLabel(pattern.handMode, leftHanded),
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <AppCard
      accessibilityLabel={accessibilityLabel ?? accessibilitySummary}
      fullWidth
      padding={compact ? "md" : "lg"}
      variant="rhythm"
    >
      <View style={styles.root}>
        {showHeader ? (
          <View style={styles.headerBlock}>
            <View style={styles.headerRow}>
              <Text style={[theme.typography.labelLarge, { color: theme.colors.textMuted, letterSpacing: 1.2 }]}>
                {patternTitle}
              </Text>
              <View style={styles.headerChips}>
                <Chip label={resolveDifficultyLabel(pattern.level)} selected size="sm" variant="status" />
                <Chip label={resolveHandModeLabel(pattern.handMode, leftHanded)} size="sm" variant="tag" />
                <Chip label={`${pattern.bars} compassos`} size="sm" variant="tag" />
              </View>
            </View>

            {patternDescription ? (
              <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary }]}>
                {patternDescription}
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.stepGrid}>
          {displaySteps.map((step, index) => {
            const stepState = resolveStepState(step, index, currentStepIndex, currentStepId);

            return (
              <RhythmStep
                key={step.id}
                compact={compact}
                fullWidth={false}
                leftHanded={leftHanded}
                onPress={onStepPress ? (pressedStep) => onStepPress(pressedStep, index) : undefined}
                state={stepState}
                step={step}
              />
            );
          })}
        </View>

        {showLegend ? (
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
            {buildLegend().join(" · ")}
          </Text>
        ) : null}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 14,
  },
  headerBlock: {
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 8,
  },
  stepGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
});
