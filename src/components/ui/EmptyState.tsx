import { useAppTheme } from "@/hooks/useAppTheme";
import type { EmptyStateProps } from "@/types/ui";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "@/components/ui/AppButton";

function DefaultEmptyIcon() {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.iconBadge, { backgroundColor: theme.colors.primarySoft }]}>
      <Text style={[theme.typography.titleMedium, { color: theme.colors.primary }]}>○</Text>
    </View>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel = "Continuar",
  onActionPress,
  secondaryActionLabel,
  onSecondaryActionPress,
  icon,
  accessibilityLabel,
}: EmptyStateProps) {
  const { theme } = useAppTheme();

  return (
    <View accessibilityLabel={accessibilityLabel ?? title} style={styles.root}>
      {icon ?? <DefaultEmptyIcon />}
      <Text style={[theme.typography.titleLarge, { color: theme.colors.textPrimary, textAlign: "center", marginTop: 16 }]}>
        {title}
      </Text>
      <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary, textAlign: "center", marginTop: 8 }]}>
        {description}
      </Text>
      {onActionPress ? (
        <View style={styles.actions}>
          <AppButton fullWidth onPress={onActionPress} variant="primary">
            {actionLabel}
          </AppButton>
        </View>
      ) : null}
      {secondaryActionLabel && onSecondaryActionPress ? (
        <View style={styles.secondaryAction}>
          <AppButton fullWidth onPress={onSecondaryActionPress} variant="secondary">
            {secondaryActionLabel}
          </AppButton>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    alignItems: "center",
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    width: "100%",
    marginTop: 20,
  },
  secondaryAction: {
    width: "100%",
    marginTop: 12,
  },
});
