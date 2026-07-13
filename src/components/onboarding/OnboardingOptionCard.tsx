import { useAppTheme } from "@/hooks/useAppTheme";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface OnboardingOptionCardProps {
  readonly title: string;
  readonly description: string;
  readonly selected: boolean;
  readonly onPress: () => void;
  readonly icon?: ReactNode;
  readonly children?: ReactNode;
}

export function OnboardingOptionCard({
  title,
  description,
  selected,
  onPress,
  icon,
  children,
}: OnboardingOptionCardProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={`${title}. ${description}`}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        {
          backgroundColor: selected ? theme.colors.surfaceRaised : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderWidth: selected ? Math.max(theme.borderWidth, 2) : theme.borderWidth,
          borderRadius: theme.radii.lg,
          opacity: pressed ? 0.82 : 1,
          padding: theme.spacing[4],
        },
      ]}
    >
      <View style={styles.row}>
        {icon ? (
          <View
            style={[
              styles.icon,
              { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radii.md },
            ]}
          >
            {icon}
          </View>
        ) : null}
        <View style={styles.textBlock}>
          <Text style={[theme.typography.titleLarge, { color: theme.colors.textPrimary }]}>{title}</Text>
          <Text
            style={[
              theme.typography.bodyMedium,
              { color: theme.colors.textSecondary, marginTop: theme.spacing[1] },
            ]}
          >
            {description}
          </Text>
        </View>
        <View
          style={[
            styles.radio,
            {
              borderColor: selected ? theme.colors.primary : theme.colors.borderStrong,
              borderWidth: 3,
              borderRadius: theme.radii.full,
            },
          ]}
        >
          {selected ? (
            <View
              style={[
                styles.radioInner,
                { backgroundColor: theme.colors.primary, borderRadius: theme.radii.full },
              ]}
            />
          ) : null}
        </View>
      </View>
      {children ? <View style={{ marginTop: theme.spacing[4] }}>{children}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    minHeight: 96,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  icon: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  textBlock: {
    flex: 1,
  },
  radio: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  radioInner: {
    width: 14,
    height: 14,
  },
});
