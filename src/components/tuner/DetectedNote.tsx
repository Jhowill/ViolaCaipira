import { AppCard } from "@/components/ui";
import { SignalQuality } from "@/components/tuner/SignalQuality";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { TunerSignalQuality } from "@/types/tuner";
import { StyleSheet, Text, View } from "react-native";

export interface DetectedNoteProps {
  readonly noteLabel: string;
  readonly targetLabel?: string;
  readonly frequencyLabel?: string;
  readonly instructionLabel?: string;
  readonly signalQuality?: TunerSignalQuality;
  readonly signalQualityDetail?: string;
  readonly compact?: boolean;
  readonly accessibilityLabel?: string;
}

const signalQualityLabels: Record<TunerSignalQuality, string> = {
  none: "Sem sinal",
  weak: "Sinal fraco",
  unstable: "Sinal instável",
  stable: "Sinal adequado",
};

function buildAccessibleLabel(
  noteLabel: string,
  targetLabel: string | undefined,
  frequencyLabel: string | undefined,
  instructionLabel: string | undefined,
  signalQuality: TunerSignalQuality | undefined,
) {
  return [
    `Nota detectada ${noteLabel}`,
    targetLabel ? `Alvo ${targetLabel}` : null,
    frequencyLabel ? `Frequência ${frequencyLabel}` : null,
    instructionLabel ?? null,
    signalQuality ? `Qualidade do sinal ${signalQualityLabels[signalQuality].toLowerCase()}` : null,
  ]
    .filter(Boolean)
    .join(". ");
}

export function DetectedNote({
  noteLabel,
  targetLabel,
  frequencyLabel,
  instructionLabel,
  signalQuality,
  signalQualityDetail,
  compact = false,
  accessibilityLabel,
}: DetectedNoteProps) {
  const { theme } = useAppTheme();
  const label = accessibilityLabel ?? buildAccessibleLabel(noteLabel, targetLabel, frequencyLabel, instructionLabel, signalQuality);
  const cardVariant =
    signalQuality === "stable" ? "selected" : signalQuality === "weak" ? "alert" : "informative";

  return (
    <AppCard accessibilityLabel={label} fullWidth padding={compact ? "md" : "lg"} variant={cardVariant}>
      <View style={[styles.root, compact ? styles.rootCompact : null]}>
        <View style={styles.headerRow}>
          <View style={styles.noteBlock}>
            <Text style={[theme.typography.labelLarge, { color: theme.colors.textMuted, letterSpacing: 1.2 }]}>
              Nota detectada
            </Text>
            <Text style={[theme.typography.music.tunerNote, { color: theme.colors.primaryPressed, marginTop: 4 }]}>
              {noteLabel}
            </Text>
          </View>

          {signalQuality ? (
            <View style={styles.qualityBlock}>
              <SignalQuality
                compact
                detail={signalQualityDetail}
                quality={signalQuality}
                accessibilityLabel={`Qualidade do sinal ${signalQualityLabels[signalQuality].toLowerCase()}`}
              />
            </View>
          ) : null}
        </View>

        <View style={styles.metricsGrid}>
          {targetLabel ? (
            <View style={styles.metricCell}>
              <Text style={[theme.typography.labelLarge, { color: theme.colors.textMuted }]}>Alvo</Text>
              <Text style={[theme.typography.music.tunerMeasurement, { color: theme.colors.textPrimary, marginTop: 2 }]}>
                {targetLabel}
              </Text>
            </View>
          ) : null}

          {frequencyLabel ? (
            <View style={styles.metricCell}>
              <Text style={[theme.typography.labelLarge, { color: theme.colors.textMuted }]}>Frequência</Text>
              <Text style={[theme.typography.music.tunerMeasurement, { color: theme.colors.textPrimary, marginTop: 2 }]}>
                {frequencyLabel}
              </Text>
            </View>
          ) : null}
        </View>

        {instructionLabel ? (
          <View style={[styles.instructionBlock, { backgroundColor: theme.colors.surfaceMuted }]}>
            <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary }]}>{instructionLabel}</Text>
          </View>
        ) : null}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 14,
  },
  rootCompact: {
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  noteBlock: {
    flex: 1,
    minWidth: 0,
  },
  qualityBlock: {
    flexShrink: 0,
    flexBasis: "42%",
    minWidth: 144,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCell: {
    flexGrow: 1,
    flexBasis: 140,
    minWidth: 0,
  },
  instructionBlock: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
