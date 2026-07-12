import { useAppTheme } from "@/hooks/useAppTheme";
import type { SectionHeaderProps } from "@/types/ui";
import {
  Pressable,
  type PressableStateCallbackType,
  StyleSheet,
  Text,
  View,
} from "react-native";

function resolvePressableInteractionState(state: PressableStateCallbackType) {
  const extendedState = state as PressableStateCallbackType & {
    readonly focused?: boolean;
    readonly hovered?: boolean;
  };

  return {
    pressed: state.pressed,
    focused: Boolean(extendedState.focused),
    hovered: Boolean(extendedState.hovered),
  };
}

export function SectionHeader({
  title,
  description,
  actionLabel = "Ver todos",
  onActionPress,
  actionAccessibilityLabel,
}: SectionHeaderProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.root}>
      <View style={styles.textBlock}>
        <Text style={[theme.typography.headlineSmall, { color: theme.colors.textPrimary }]}>{title}</Text>
        {description ? (
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary, marginTop: 4 }]}>
            {description}
          </Text>
        ) : null}
      </View>
      {onActionPress ? (
        <Pressable
          accessibilityLabel={actionAccessibilityLabel ?? actionLabel}
          accessibilityRole="button"
          hitSlop={4}
          onPress={onActionPress}
          style={(state) => {
            const interactionState = resolvePressableInteractionState(state);

            return [
              styles.action,
              interactionState.pressed ? { opacity: 0.7 } : null,
              interactionState.focused
                ? {
                    outlineColor: theme.colors.focusRing,
                    outlineStyle: "solid",
                    outlineWidth: theme.borderWidth + 1,
                  }
                : null,
            ];
          }}
        >
          <Text style={[theme.typography.labelLarge, { color: theme.colors.primary }]}>
            {actionLabel}
          </Text>
          <Text style={[theme.typography.labelLarge, { color: theme.colors.primary }]}>›</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  textBlock: {
    flex: 1,
    marginRight: 12,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
  },
});
