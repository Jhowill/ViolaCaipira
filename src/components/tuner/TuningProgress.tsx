import { AppCard, Chip } from "@/components/ui";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { TunerGuidedProgress, TunerTarget } from "@/types/tuner";
import { StyleSheet, Text, View, type GestureResponderEvent } from "react-native";

export interface TuningProgressProps {
  readonly progress: TunerGuidedProgress;
  readonly title?: string;
  readonly description?: string;
  readonly stepLabels?: readonly string[];
  readonly compact?: boolean;
  readonly onStepPress?: (params: { readonly target: TunerTarget; readonly index: number }) => void;
  readonly accessibilityLabel?: string;
}

function clampIndex(index: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.min(total - 1, Math.max(0, index));
}

function buildStepLabels(progress: TunerGuidedProgress, stepLabels: readonly string[] | undefined) {
  return progress.targets.map((target, index) => stepLabels?.[index] ?? target.label ?? `${index + 1}ª`);
}

export function TuningProgress({
  progress,
  title = "Progresso",
  description,
  stepLabels,
  compact = false,
  onStepPress,
  accessibilityLabel,
}: TuningProgressProps) {
  const { theme } = useAppTheme();
  const labels = buildStepLabels(progress, stepLabels);
  const currentIndex = clampIndex(progress.index, progress.targets.length);
  const summaryLabel = progress.isComplete ? "Concluído" : `${currentIndex + 1} de ${progress.totalCount}`;

  return (
    <AppCard
      accessibilityLabel={accessibilityLabel ?? `${title}. ${summaryLabel}.`}
      fullWidth
      padding={compact ? "md" : "lg"}
      variant="informative"
    >
      <View style={styles.root}>
        <View style={styles.headerRow}>
          <Text style={[theme.typography.labelLarge, { color: theme.colors.textMuted, letterSpacing: 1.2 }]}>
            {title}
          </Text>
          <Chip label={summaryLabel} selected variant="selection" />
        </View>

        {description ? (
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary }]}>{description}</Text>
        ) : null}

        <View style={styles.chipRow}>
          {labels.map((label, index) => {
            const target = progress.targets[index];
            if (!target) {
              return null;
            }

            const selected = index === currentIndex;

            if (onStepPress) {
              return (
                <Chip
                  key={`${target.label}-${index}`}
                  accessibilityLabel={`Abrir etapa ${label}`}
                  label={label}
                  onPress={(event: GestureResponderEvent) => {
                    event?.stopPropagation?.();
                    onStepPress({ target, index });
                  }}
                  selected={selected}
                  size="sm"
                  variant={selected ? "selection" : "filter"}
                />
              );
            }

            return (
              <Chip
                key={`${target.label}-${index}`}
                label={label}
                selected={selected}
                size="sm"
                variant={selected ? "selection" : "filter"}
              />
            );
          })}
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
