import { useAppTheme } from "@/hooks/useAppTheme";
import { StyleSheet, Text, View } from "react-native";

export type TuningStatusBadgeState = "tuned" | "below" | "above" | "incompatible" | "waiting";

export interface TuningStatusBadgeProps {
  readonly status: TuningStatusBadgeState;
  readonly cents?: number | null;
  readonly compact?: boolean;
  readonly accessibilityLabel?: string;
}

interface BadgePalette {
  readonly background: string;
  readonly border: string;
  readonly text: string;
  readonly icon: string;
  readonly label: string;
  readonly accessibilityLabel: string;
}

function formatCents(cents: number | null | undefined): string | null {
  if (cents === null || cents === undefined || !Number.isFinite(cents)) {
    return null;
  }

  return `${Math.abs(Math.round(cents))}\u00A2`;
}

function resolveBadgePalette(
  status: TuningStatusBadgeState,
  cents: number | null | undefined,
  theme: ReturnType<typeof useAppTheme>["theme"],
): BadgePalette {
  const centsLabel = formatCents(cents);

  switch (status) {
    case "tuned":
      return {
        background: theme.colors.successSoft,
        border: theme.colors.success,
        text: theme.colors.success,
        icon: "\u2713",
        label: "Afinada",
        accessibilityLabel: centsLabel ? `Afinada. Desvio de ${centsLabel}.` : "Afinada.",
      };
    case "below":
      return {
        background: theme.colors.warningSoft,
        border: theme.colors.warning,
        text: theme.colors.warning,
        icon: "\u2193",
        label: centsLabel ? `Abaixo ${centsLabel}` : "Abaixo",
        accessibilityLabel: centsLabel ? `Nota abaixo. Falta ${centsLabel}.` : "Nota abaixo.",
      };
    case "above":
      return {
        background: theme.colors.infoSoft,
        border: theme.colors.info,
        text: theme.colors.info,
        icon: "\u2191",
        label: centsLabel ? `Acima ${centsLabel}` : "Acima",
        accessibilityLabel: centsLabel ? `Nota acima. Excesso de ${centsLabel}.` : "Nota acima.",
      };
    case "incompatible":
      return {
        background: theme.colors.dangerSoft,
        border: theme.colors.danger,
        text: theme.colors.danger,
        icon: "\u26A0",
        label: "Incompatível",
        accessibilityLabel: "Incompatível com a afinação ativa.",
      };
    case "waiting":
    default:
      return {
        background: theme.colors.surfaceMuted,
        border: theme.colors.border,
        text: theme.colors.textSecondary,
        icon: "\u2026",
        label: "Aguardando",
        accessibilityLabel: "Aguardando leitura.",
      };
  }
}

export function TuningStatusBadge({
  status,
  cents,
  compact = false,
  accessibilityLabel,
}: TuningStatusBadgeProps) {
  const { theme } = useAppTheme();
  const palette = resolveBadgePalette(status, cents, theme);

  return (
    <View
      accessibilityLabel={accessibilityLabel ?? palette.accessibilityLabel}
      accessibilityRole="text"
      style={[
        styles.root,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
          borderRadius: theme.radii.full,
          borderWidth: theme.borderWidth,
          paddingHorizontal: compact ? 10 : 12,
          paddingVertical: compact ? 6 : 8,
        },
      ]}
    >
      <Text style={[styles.icon, { color: palette.text, fontSize: compact ? 14 : 15 }]}>
        {palette.icon}
      </Text>
      <Text
        numberOfLines={1}
        style={[
          compact ? theme.typography.labelSmall : theme.typography.labelMedium,
          { color: palette.text, marginLeft: 6 },
        ]}
      >
        {palette.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderStyle: "solid",
    overflow: "hidden",
  },
  icon: {
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
