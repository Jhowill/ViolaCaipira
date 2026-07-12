import { useAppTheme } from "@/hooks/useAppTheme";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

export type OfflineBadgeVariant = "available" | "limited" | "warning";

export interface OfflineBadgeProps {
  readonly label?: string;
  readonly description?: string;
  readonly variant?: OfflineBadgeVariant;
  readonly icon?: ReactNode;
  readonly visible?: boolean;
  readonly testID?: string;
}

function resolveBadgeVariant(theme: ReturnType<typeof useAppTheme>["theme"], variant: OfflineBadgeVariant) {
  switch (variant) {
    case "limited":
      return {
        backgroundColor: theme.colors.warningSoft,
        borderColor: theme.colors.warning,
        textColor: theme.colors.warning,
        symbol: "!",
      } as const;
    case "warning":
      return {
        backgroundColor: theme.colors.dangerSoft,
        borderColor: theme.colors.danger,
        textColor: theme.colors.danger,
        symbol: "!",
      } as const;
    case "available":
    default:
      return {
        backgroundColor: theme.colors.successSoft,
        borderColor: theme.colors.success,
        textColor: theme.colors.success,
        symbol: "✓",
      } as const;
  }
}

export function OfflineBadge({
  label = "Disponível offline",
  description,
  variant = "available",
  icon,
  visible = true,
  testID,
}: OfflineBadgeProps) {
  const { theme } = useAppTheme();

  if (!visible) {
    return null;
  }

  const badgeStyle = resolveBadgeVariant(theme, variant);

  return (
    <View
      accessibilityRole="text"
      style={[
        styles.container,
        {
          backgroundColor: badgeStyle.backgroundColor,
          borderColor: badgeStyle.borderColor,
          borderWidth: theme.borderWidth,
          borderRadius: theme.radii.full,
        },
      ]}
      testID={testID}
    >
      <View style={[styles.iconBadge, { backgroundColor: badgeStyle.borderColor }]}>
        {icon ? icon : <Text style={[styles.iconText, { color: theme.colors.onPrimary, ...theme.typography.labelSmall }]}>{badgeStyle.symbol}</Text>}
      </View>

      <View style={styles.textColumn}>
        <Text style={[styles.label, { color: badgeStyle.textColor, ...theme.typography.labelMedium }]}>{label}</Text>
        {description ? <Text style={[styles.description, { color: theme.colors.textSecondary, ...theme.typography.caption }]}>{description}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    marginTop: -1,
  },
  textColumn: {
    flex: 1,
    gap: 1,
  },
  label: {
    flexShrink: 1,
  },
  description: {
    flexShrink: 1,
  },
});
