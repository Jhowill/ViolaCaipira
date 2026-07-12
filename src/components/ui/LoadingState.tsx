import { useAppTheme } from "@/hooks/useAppTheme";
import type { LoadingStateProps, LoadingStateVariant } from "@/types/ui";
import { ActivityIndicator, StyleSheet, Text, View, type DimensionValue } from "react-native";

function SkeletonBar({
  width,
  height,
}: {
  readonly width: DimensionValue;
  readonly height: number;
}) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          backgroundColor: theme.colors.surfaceStrong,
        },
      ]}
    />
  );
}

function renderSkeletonRows(
  variant: LoadingStateVariant,
  rows: number,
  theme: ReturnType<typeof useAppTheme>["theme"],
) {
  if (variant === "inline") {
    return null;
  }

  const blocks = Array.from({ length: rows }, (_, index) => index);

  return (
    <View style={styles.stack}>
      {variant === "screen" ? (
        <View style={styles.stack}>
          <SkeletonBar width="64%" height={18} />
          <View style={{ height: theme.spacing[2] }} />
          <SkeletonBar width="88%" height={12} />
          <SkeletonBar width="72%" height={12} />
        </View>
      ) : null}
      {blocks.map((index) => (
        <View key={index} style={styles.row}>
          <SkeletonBar width={variant === "card" ? "100%" : "24%"} height={variant === "card" ? 64 : 16} />
          {variant !== "card" ? (
            <View style={styles.rowText}>
              <SkeletonBar width={`${84 - index * 8}%`} height={12} />
              <View style={{ height: theme.spacing[1] }} />
              <SkeletonBar width={`${68 - index * 6}%`} height={10} />
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

export function LoadingState({
  title,
  description,
  variant = "screen",
  rows = 3,
  accessibilityLabel = "Carregando",
}: LoadingStateProps) {
  const { theme } = useAppTheme();

  if (variant === "inline") {
    return (
      <View accessibilityLabel={accessibilityLabel} accessibilityRole="progressbar" style={styles.inline}>
        <ActivityIndicator color={theme.colors.primary} />
        {title ? (
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary, marginLeft: 8 }]}>
            {title}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View accessibilityLabel={accessibilityLabel} accessibilityRole="progressbar" style={styles.root}>
      {title ? <Text style={[theme.typography.titleLarge, { color: theme.colors.textPrimary }]}>{title}</Text> : null}
      {description ? (
        <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary, marginTop: 4 }]}>
          {description}
        </Text>
      ) : null}
      <View style={{ marginTop: theme.spacing[4] }}>{renderSkeletonRows(variant, rows, theme)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
  },
  stack: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  rowText: {
    flex: 1,
    marginLeft: 12,
  },
  skeleton: {
    borderRadius: 999,
  },
});
