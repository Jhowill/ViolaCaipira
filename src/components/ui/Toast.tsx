import { useAppTheme } from "@/hooks/useAppTheme";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type PressableStateCallbackType } from "react-native";

export type ToastVariant = "neutral" | "info" | "success" | "warning" | "danger";

export interface ToastProps {
  readonly visible: boolean;
  readonly title: string;
  readonly description?: string;
  readonly actionLabel?: string;
  readonly onActionPress?: () => void;
  readonly onDismiss?: () => void;
  readonly icon?: ReactNode;
  readonly variant?: ToastVariant;
  readonly testID?: string;
}

function resolveToastVariant(theme: ReturnType<typeof useAppTheme>["theme"], variant: ToastVariant) {
  switch (variant) {
    case "success":
      return {
        backgroundColor: theme.colors.successSoft,
        borderColor: theme.colors.success,
        textColor: theme.colors.success,
        symbol: "✓",
      } as const;
    case "warning":
      return {
        backgroundColor: theme.colors.warningSoft,
        borderColor: theme.colors.warning,
        textColor: theme.colors.warning,
        symbol: "!",
      } as const;
    case "danger":
      return {
        backgroundColor: theme.colors.dangerSoft,
        borderColor: theme.colors.danger,
        textColor: theme.colors.danger,
        symbol: "!",
      } as const;
    case "info":
      return {
        backgroundColor: theme.colors.infoSoft,
        borderColor: theme.colors.info,
        textColor: theme.colors.info,
        symbol: "i",
      } as const;
    case "neutral":
    default:
      return {
        backgroundColor: theme.colors.surfaceMuted,
        borderColor: theme.colors.border,
        textColor: theme.colors.textSecondary,
        symbol: "•",
      } as const;
  }
}

type PressableInteractionState = PressableStateCallbackType & {
  readonly focused?: boolean;
  readonly hovered?: boolean;
};

function resolvePressableInteractionState(state: PressableStateCallbackType) {
  const interactionState = state as PressableInteractionState;

  return {
    pressed: interactionState.pressed,
    focused: interactionState.focused ?? false,
    hovered: interactionState.hovered ?? false,
  };
}

export function Toast({
  visible,
  title,
  description,
  actionLabel,
  onActionPress,
  onDismiss,
  icon,
  variant = "neutral",
  testID,
}: ToastProps) {
  const { theme } = useAppTheme();

  if (!visible) {
    return null;
  }

  const variantStyle = resolveToastVariant(theme, variant);

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.card,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          borderWidth: theme.borderWidth,
          borderRadius: theme.radii.lg,
        },
      ]}
      testID={testID}
    >
      <View style={styles.contentRow}>
        <View style={[styles.iconBadge, { backgroundColor: variantStyle.borderColor }]}>
          {icon ? icon : <Text style={[styles.iconText, { color: theme.colors.onPrimary, ...theme.typography.labelLarge }]}>{variantStyle.symbol}</Text>}
        </View>

        <View style={styles.textColumn}>
          <Text style={[styles.title, { color: theme.colors.textPrimary, ...theme.typography.labelLarge }]}>{title}</Text>
          {description ? <Text style={[styles.description, { color: theme.colors.textSecondary, ...theme.typography.bodySmall }]}>{description}</Text> : null}
        </View>

        {onDismiss ? (
          <Pressable
            accessibilityLabel="Fechar aviso"
            accessibilityRole="button"
            onPress={onDismiss}
            style={(state) => {
              const { focused, hovered, pressed } = resolvePressableInteractionState(state);

              return [
                styles.closeButton,
                {
                  borderColor: focused ? theme.colors.focusRing : "transparent",
                  opacity: pressed ? 0.72 : hovered ? 0.88 : 1,
                },
              ];
            }}
          >
            <Text style={[styles.closeText, { color: theme.colors.textMuted, ...theme.typography.labelLarge }]}>×</Text>
          </Pressable>
        ) : null}
      </View>

      {actionLabel && onActionPress ? (
        <Pressable
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          onPress={onActionPress}
          style={(state) => {
            const { focused, hovered, pressed } = resolvePressableInteractionState(state);

            return [
              styles.actionButton,
              {
                borderColor: focused ? theme.colors.focusRing : "transparent",
                opacity: pressed ? 0.76 : hovered ? 0.9 : 1,
              },
            ];
          }}
        >
          <Text style={[styles.actionText, { color: variantStyle.textColor, ...theme.typography.labelLarge }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    gap: 12,
    padding: 14,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    marginTop: -1,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  title: {
    flexShrink: 1,
  },
  description: {
    flexShrink: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  closeText: {
    marginTop: -1,
  },
  actionButton: {
    alignSelf: "flex-start",
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    marginTop: -1,
  },
});
