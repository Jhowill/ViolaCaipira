import { useAppTheme } from "@/hooks/useAppTheme";
import { Pressable, StyleSheet, Text, View } from "react-native";

export interface ActiveTuningPillProps {
  readonly label?: string;
  readonly value: string;
  readonly detail?: string;
  readonly onPress?: () => void;
}

export function ActiveTuningPill({
  label = "Afinação ativa",
  value,
  detail,
  onPress,
}: ActiveTuningPillProps) {
  const { theme } = useAppTheme();

  const content = (
    <>
      <View style={[styles.iconBadge, { backgroundColor: theme.colors.primarySoft }]}>
        <Text style={[theme.typography.titleSmall, { color: theme.colors.primary }]}>♪</Text>
      </View>

      <View style={styles.textBlock}>
        <Text style={[theme.typography.labelMedium, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>
        <Text style={[theme.typography.titleMedium, { color: theme.colors.textPrimary, marginTop: 2 }]}>
          {value}
        </Text>
        {detail ? (
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 2 }]}>
            {detail}
          </Text>
        ) : null}
      </View>

      {onPress ? (
        <Text style={[theme.typography.titleMedium, { color: theme.colors.primary }]}>›</Text>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={`Abrir afinações. ${value}`}
        accessibilityRole="button"
        hitSlop={6}
        onPress={onPress}
        style={({ pressed }) => [
          styles.root,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: theme.borderWidth,
            borderRadius: theme.radii.xl,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      accessibilityLabel={`${label}: ${value}`}
      accessibilityRole="text"
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: theme.borderWidth,
          borderRadius: theme.radii.xl,
        },
      ]}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    overflow: "hidden",
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
  },
});
