import { AppCard } from "@/components/ui";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { TunerSignalQuality } from "@/types/tuner";
import { StyleSheet, Text, View } from "react-native";

export interface TunerGaugeProps {
  readonly cents: number;
  readonly statusLabel: string;
  readonly detailLabel?: string;
  readonly signalQuality?: TunerSignalQuality;
  readonly compact?: boolean;
  readonly accessibilityLabel?: string;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function formatCentsLabel(cents: number): string {
  if (!Number.isFinite(cents)) {
    return "0 cents";
  }

  const prefix = cents > 0 ? "+" : "";
  const value = Number.isInteger(cents) ? String(cents) : cents.toFixed(1).replace(/\.0$/, "");

  return `${prefix}${value} cents`;
}

function resolveTone(signalQuality: TunerSignalQuality | undefined, cents: number) {
  if (signalQuality === "stable" || Math.abs(cents) <= 3) {
    return "success" as const;
  }

  if (signalQuality === "weak" || signalQuality === "none") {
    return "warning" as const;
  }

  return "warning" as const;
}

function resolveSignalLabel(signalQuality: TunerSignalQuality | undefined): string | null {
  switch (signalQuality) {
    case "stable":
      return "Sinal adequado";
    case "weak":
      return "Sinal fraco";
    case "unstable":
      return "Sinal instável";
    case "none":
      return "Sem sinal";
    default:
      return null;
  }
}

function formatScaleLabel(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

export function TunerGauge({
  cents,
  statusLabel,
  detailLabel,
  signalQuality,
  compact = false,
  accessibilityLabel,
}: TunerGaugeProps) {
  const { theme } = useAppTheme();
  const clampedCents = clamp(cents, -50, 50);
  const measurementLabel = detailLabel ?? formatCentsLabel(cents);
  const tone = resolveTone(signalQuality, cents);
  const gaugeColor =
    tone === "success"
      ? theme.colors.success
      : tone === "warning"
        ? theme.colors.warning
        : theme.colors.textMuted;
  const trackColor =
    tone === "success"
      ? theme.colors.successSoft
      : tone === "warning"
        ? theme.colors.warningSoft
        : theme.colors.border;
  const angle = (clampedCents / 50) * 70;
  const scaleLabels = [-50, -25, 0, 25, 50] as const;
  const signalLabel = resolveSignalLabel(signalQuality);

  return (
    <AppCard
      accessibilityLabel={accessibilityLabel ?? [statusLabel, measurementLabel, signalLabel].filter(Boolean).join(". ")}
      fullWidth
      padding={compact ? "md" : "lg"}
      variant="informative"
    >
      <View style={styles.root}>
        <View style={styles.headerRow}>
          <Text style={[theme.typography.labelLarge, { color: theme.colors.textMuted, letterSpacing: 1.2 }]}>
            Medidor
          </Text>
          {signalLabel ? (
            <Text style={[theme.typography.labelLarge, { color: gaugeColor }]}>{signalLabel}</Text>
          ) : null}
        </View>

        <View style={[styles.gaugeArea, compact ? styles.gaugeAreaCompact : null]}>
          <View
            style={[
              styles.arc,
              {
                borderColor: trackColor,
                height: compact ? 132 : 156,
              },
            ]}
          />

          <View
            testID="tuner-gauge-needle"
            style={[
              styles.needle,
              {
                backgroundColor: gaugeColor,
                transform: [{ rotate: `${angle}deg` }],
              },
            ]}
          />

          <View style={[styles.centerDot, { backgroundColor: gaugeColor }]} />

          <View style={styles.scaleRow}>
            {scaleLabels.map((label) => (
              <Text key={label} style={[theme.typography.labelMedium, { color: theme.colors.textSecondary }]}>
                {formatScaleLabel(label)}
              </Text>
            ))}
          </View>

          <View style={styles.statusBlock}>
            <Text style={[theme.typography.headlineMedium, { color: gaugeColor, textAlign: "center" }]}>
              {statusLabel}
            </Text>
            <Text
              style={[
                theme.typography.music.tunerMeasurement,
                {
                  color: theme.colors.textSecondary,
                  textAlign: "center",
                  marginTop: 4,
                },
              ]}
            >
              {measurementLabel}
            </Text>
          </View>
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
  gaugeArea: {
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: 260,
    paddingBottom: 48,
  },
  gaugeAreaCompact: {
    minHeight: 236,
    paddingBottom: 44,
  },
  arc: {
    width: "100%",
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 14,
    borderBottomWidth: 0,
    borderStyle: "solid",
    backgroundColor: "transparent",
  },
  needle: {
    position: "absolute",
    left: "50%",
    bottom: 44,
    width: 5,
    height: 118,
    marginLeft: -2.5,
    borderRadius: 999,
  },
  centerDot: {
    position: "absolute",
    left: "50%",
    bottom: 28,
    width: 24,
    height: 24,
    marginLeft: -12,
    borderRadius: 999,
  },
  scaleRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  statusBlock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 38,
    alignItems: "center",
    gap: 2,
  },
});
