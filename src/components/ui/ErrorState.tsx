import { AppButton } from "@/components/ui/AppButton";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { ErrorStateProps } from "@/types/ui";
import { StyleSheet, Text, View } from "react-native";

function DefaultErrorIcon() {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.iconBadge, { backgroundColor: theme.colors.dangerSoft }]}>
      <Text style={[theme.typography.titleMedium, { color: theme.colors.danger }]}>!</Text>
    </View>
  );
}

export function ErrorState({
  title,
  description,
  details,
  actionLabel = "Tentar novamente",
  onActionPress,
  secondaryActionLabel,
  onSecondaryActionPress,
  icon,
  accessibilityLabel,
}: ErrorStateProps) {
  const { theme } = useAppTheme();

  return (
    <View accessibilityLabel={accessibilityLabel ?? title} style={styles.root}>
      {icon ?? <DefaultErrorIcon />}
      <Text style={[theme.typography.titleLarge, { color: theme.colors.textPrimary, textAlign: "center", marginTop: 16 }]}>
        {title}
      </Text>
      <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary, textAlign: "center", marginTop: 8 }]}>
        {description}
      </Text>
      {details ? (
        <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, textAlign: "center", marginTop: 8 }]}>
          {details}
        </Text>
      ) : null}
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
