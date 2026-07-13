import { useAppTheme } from "@/hooks/useAppTheme";
import { StyleSheet, Text, View } from "react-native";

export type ChordStatusBadgeTone = "neutral" | "success" | "warning" | "danger" | "accent";

export interface ChordStatusBadgeProps {
  readonly label: string;
  readonly tone?: ChordStatusBadgeTone;
  readonly icon?: string;
  readonly compact?: boolean;
  readonly accessibilityLabel?: string;
}

interface Palette {
  readonly background: string;
  readonly border: string;
  readonly text: string;
  readonly icon: string;
}

function resolvePalette(tone: ChordStatusBadgeTone, theme: ReturnType<typeof useAppTheme>["theme"]): Palette {
  switch (tone) {
    case "success":
      return {
        background: theme.colors.successSoft,
        border: theme.colors.success,
        text: theme.colors.success,
        icon: theme.colors.success,
      };
    case "warning":
      return {
        background: theme.colors.warningSoft,
        border: theme.colors.warning,
        text: theme.colors.warning,
        icon: theme.colors.warning,
      };
    case "danger":
      return {
        background: theme.colors.dangerSoft,
        border: theme.colors.danger,
        text: theme.colors.danger,
        icon: theme.colors.danger,
      };
    case "accent":
      return {
        background: theme.colors.primarySoft,
        border: theme.colors.primary,
        text: theme.colors.primaryPressed,
        icon: theme.colors.primaryPressed,
      };
    case "neutral":
    default:
      return {
        background: theme.colors.surfaceMuted,
        border: theme.colors.border,
        text: theme.colors.textSecondary,
        icon: theme.colors.textSecondary,
      };
  }
}

export function ChordStatusBadge({
  label,
  tone = "neutral",
  icon,
  compact = false,
  accessibilityLabel,
}: ChordStatusBadgeProps) {
  const { theme } = useAppTheme();
  const palette = resolvePalette(tone, theme);

  return (
    <View
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="text"
      style={[
        styles.root,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
          borderWidth: theme.borderWidth,
          borderRadius: theme.radii.full,
          paddingHorizontal: compact ? 10 : 12,
          paddingVertical: compact ? 6 : 8,
        },
      ]}
    >
      {icon ? (
        <Text style={[styles.icon, { color: palette.icon, marginRight: 6 }]}>{icon}</Text>
      ) : null}
      <Text
        numberOfLines={1}
        style={[
          compact ? theme.typography.labelSmall : theme.typography.labelMedium,
          {
            color: palette.text,
          },
        ]}
      >
        {label}
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
