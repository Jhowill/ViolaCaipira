import { useAppTheme } from "@/hooks/useAppTheme";
import type { TunerSignalQuality, TunerSignalWeaknessReason } from "@/types/tuner";
import { StyleSheet, Text, View } from "react-native";

export interface SignalQualityProps {
  readonly quality: TunerSignalQuality;
  readonly detail?: string;
  readonly weaknessReason?: TunerSignalWeaknessReason;
  readonly sampleCount?: number;
  readonly compact?: boolean;
  readonly accessibilityLabel?: string;
}

type QualityTone = "success" | "warning" | "neutral";

interface QualityCopy {
  readonly label: string;
  readonly detail?: string;
  readonly icon: string;
  readonly tone: QualityTone;
}

function resolveQualityCopy(
  quality: TunerSignalQuality,
  detail: string | undefined,
  weaknessReason: TunerSignalWeaknessReason | undefined,
  sampleCount: number | undefined,
): QualityCopy {
  switch (quality) {
    case "stable":
      return {
        label: "Sinal adequado",
        detail: detail ?? (sampleCount ? `${sampleCount} amostras` : undefined),
        icon: "✓",
        tone: "success",
      };
    case "weak":
      return {
        label: "Sinal fraco",
        detail:
          detail ??
          (weaknessReason === "low_amplitude"
            ? "Amplitude baixa"
            : weaknessReason === "invalid_frequency"
              ? "Frequência inválida"
              : weaknessReason === "insufficient_samples"
                ? "Poucas amostras"
                : weaknessReason === "unstable_window"
                  ? "Janela instável"
                  : undefined),
        icon: "!",
        tone: "warning",
      };
    case "unstable":
      return {
        label: "Sinal instável",
        detail: detail ?? (sampleCount ? `${sampleCount} amostras` : undefined),
        icon: "≈",
        tone: "warning",
      };
    case "none":
    default:
      return {
        label: "Sem sinal",
        detail: detail ?? "Aguardando leitura",
        icon: "○",
        tone: "neutral",
      };
  }
}

export function SignalQuality({
  quality,
  detail,
  weaknessReason,
  sampleCount,
  compact = false,
  accessibilityLabel,
}: SignalQualityProps) {
  const { theme } = useAppTheme();
  const copy = resolveQualityCopy(quality, detail, weaknessReason, sampleCount);

  const palette = {
    success: {
      background: theme.colors.successSoft,
      border: theme.colors.success,
      foreground: theme.colors.success,
    },
    warning: {
      background: theme.colors.warningSoft,
      border: theme.colors.warning,
      foreground: theme.colors.warning,
    },
    neutral: {
      background: theme.colors.surfaceMuted,
      border: theme.colors.border,
      foreground: theme.colors.textSecondary,
    },
  }[copy.tone];

  return (
    <View
      accessibilityLabel={accessibilityLabel ?? [copy.label, copy.detail].filter(Boolean).join(". ")}
      accessibilityRole="text"
      style={[
        styles.root,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
          borderWidth: theme.borderWidth,
          borderRadius: compact ? 999 : 24,
          paddingHorizontal: compact ? 12 : 14,
          paddingVertical: compact ? 10 : 12,
        },
      ]}
    >
      <View
        style={[
          styles.iconBadge,
          {
            backgroundColor: theme.colors.surface,
            width: compact ? 32 : 38,
            height: compact ? 32 : 38,
          },
        ]}
      >
        <Text style={[theme.typography.labelLarge, { color: palette.foreground }]}>{copy.icon}</Text>
      </View>

      <View style={styles.textBlock}>
        <Text style={[theme.typography.labelLarge, { color: palette.foreground }]}>{copy.label}</Text>
        {copy.detail ? (
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 2 }]}>
            {copy.detail}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderStyle: "solid",
  },
  iconBadge: {
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
});
