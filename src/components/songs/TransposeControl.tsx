import { useAppTheme } from "@/hooks/useAppTheme";
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";

export interface TransposeControlProps {
  readonly currentKeyLabel: string;
  readonly originalKeyLabel?: string;
  readonly label?: string;
  readonly helperText?: string;
  readonly compact?: boolean;
  readonly disabledDecrease?: boolean;
  readonly disabledIncrease?: boolean;
  readonly onDecrease: () => void;
  readonly onIncrease: () => void;
  readonly accessibilityLabel?: string;
}

function buildAccessibleLabel(
  label: string | undefined,
  currentKeyLabel: string,
  originalKeyLabel: string | undefined,
  helperText: string | undefined,
) {
  return [label ?? "Tom atual", currentKeyLabel, originalKeyLabel, helperText].filter(Boolean).join(". ");
}

function ControlButton({
  label,
  accessibilityLabel,
  onPress,
  disabled,
  backgroundColor,
  color,
}: {
  readonly label: string;
  readonly accessibilityLabel: string;
  readonly onPress: () => void;
  readonly disabled?: boolean;
  readonly backgroundColor: string;
  readonly color: string;
}) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={(event: GestureResponderEvent) => {
        event?.stopPropagation?.();
        onPress();
      }}
      style={({ pressed }) => [
        styles.controlButton,
        {
          backgroundColor,
          borderColor: theme.colors.border,
          borderWidth: theme.borderWidth,
          opacity: disabled ? 0.5 : pressed ? 0.84 : 1,
        },
      ]}
    >
      <Text style={[theme.typography.titleMedium, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function TransposeControl({
  currentKeyLabel,
  originalKeyLabel,
  label = "Tom atual",
  helperText,
  compact = false,
  disabledDecrease = false,
  disabledIncrease = false,
  onDecrease,
  onIncrease,
  accessibilityLabel,
}: TransposeControlProps) {
  const { theme } = useAppTheme();
  const accessibleLabel = accessibilityLabel ?? buildAccessibleLabel(label, currentKeyLabel, originalKeyLabel, helperText);

  return (
    <View
      accessibilityLabel={accessibleLabel}
      accessibilityRole="adjustable"
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: theme.borderWidth,
          borderRadius: theme.radii.xl,
          paddingHorizontal: compact ? 12 : 16,
          paddingVertical: compact ? 12 : 14,
        },
      ]}
    >
      <ControlButton
        accessibilityLabel="Diminuir tom"
        backgroundColor={theme.colors.surfaceMuted}
        color={theme.colors.textPrimary}
        disabled={disabledDecrease}
        label="−"
        onPress={onDecrease}
      />

      <View style={styles.centerBlock}>
        <Text style={[theme.typography.labelLarge, { color: theme.colors.textMuted, textAlign: "center" }]}>{label}</Text>
        <Text
          numberOfLines={1}
          style={[
            compact ? theme.typography.headlineSmall : theme.typography.headlineMedium,
            {
              color: theme.colors.primaryPressed,
              textAlign: "center",
              marginTop: 2,
            },
          ]}
        >
          {currentKeyLabel}
        </Text>
        {originalKeyLabel ? (
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, textAlign: "center", marginTop: 4 }]}>
            {helperText ?? `Original: ${originalKeyLabel}`}
          </Text>
        ) : helperText ? (
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, textAlign: "center", marginTop: 4 }]}>
            {helperText}
          </Text>
        ) : null}
      </View>

      <ControlButton
        accessibilityLabel="Aumentar tom"
        backgroundColor={theme.colors.surfaceMuted}
        color={theme.colors.textPrimary}
        disabled={disabledIncrease}
        label="+"
        onPress={onIncrease}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderStyle: "solid",
  },
  centerBlock: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
  },
  controlButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "solid",
    flexShrink: 0,
  },
});
