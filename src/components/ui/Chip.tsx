import { useAppTheme } from "@/hooks/useAppTheme";
import type { ChipProps, ChipSize, ChipVariant } from "@/types/ui";
import { useMemo } from "react";
import {
  Pressable,
  type PressableStateCallbackType,
  StyleSheet,
  Text,
  View,
} from "react-native";

const chipHeights: Record<ChipSize, number> = {
  sm: 32,
  md: 36,
};

function resolveChipPalette(
  variant: ChipVariant,
  selected: boolean,
  theme: ReturnType<typeof useAppTheme>["theme"],
) {
  const { colors } = theme;

  if (selected) {
    return {
      background: colors.primarySoft,
      backgroundPressed: colors.primarySoft,
      border: colors.primary,
      text: colors.primaryPressed,
      icon: colors.primary,
    };
  }

  switch (variant) {
    case "status":
      return {
        background: colors.surfaceRaised,
        backgroundPressed: colors.surfaceMuted,
        border: colors.border,
        text: colors.textSecondary,
        icon: colors.textSecondary,
      };
    case "tag":
      return {
        background: colors.surfaceMuted,
        backgroundPressed: colors.surfaceStrong,
        border: colors.border,
        text: colors.textPrimary,
        icon: colors.textPrimary,
      };
    case "chord":
      return {
        background: colors.surface,
        backgroundPressed: colors.surfaceRaised,
        border: colors.primarySoft,
        text: colors.primary,
        icon: colors.primary,
      };
    case "note":
      return {
        background: colors.surface,
        backgroundPressed: colors.surfaceRaised,
        border: colors.accentSoft,
        text: colors.accent,
        icon: colors.accent,
      };
    case "selection":
    case "filter":
    default:
      return {
        background: colors.surface,
        backgroundPressed: colors.surfaceRaised,
        border: colors.border,
        text: colors.textPrimary,
        icon: colors.textPrimary,
      };
  }
}

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

export function Chip({
  label,
  variant = "filter",
  size = "sm",
  selected = false,
  disabled = false,
  icon,
  removable = false,
  onRemovePress,
  accessibilityLabel,
  onPress,
  ...pressableProps
}: ChipProps) {
  const { theme } = useAppTheme();
  const palette = useMemo(
    () => resolveChipPalette(variant, selected, theme),
    [selected, theme, variant],
  );
  const interactive = Boolean(onPress) || removable;
  const height = chipHeights[size];

  const chipBody = (
    <>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text
        numberOfLines={1}
        style={[
          theme.typography.labelMedium,
          {
            color: palette.text,
            fontWeight: variant === "chord" ? "700" : "600",
          },
        ]}
      >
        {label}
      </Text>
      {removable ? (
      <Pressable
        accessibilityLabel={`Remover ${label}`}
        accessibilityRole="button"
        hitSlop={4}
        onPress={(event) => {
            event.stopPropagation();
            onRemovePress?.();
          }}
          style={(state) => {
            const interactionState = resolvePressableInteractionState(state);

            return [
              styles.removeButton,
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
          <Text style={[theme.typography.labelLarge, { color: palette.icon }]}>×</Text>
        </Pressable>
      ) : null}
    </>
  );

  if (!interactive) {
    return (
      <View
        {...pressableProps}
        style={[
          styles.chip,
          {
            minHeight: height,
            paddingHorizontal: size === "sm" ? 12 : 14,
            borderRadius: theme.radii.full,
            backgroundColor: palette.background,
            borderColor: palette.border,
            borderWidth: theme.borderWidth,
          },
        ]}
      >
        {chipBody}
      </View>
    );
  }

  return (
    <Pressable
      {...pressableProps}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={(state) => {
        const interactionState = resolvePressableInteractionState(state);

        return [
          styles.chip,
          {
            minHeight: height,
            paddingHorizontal: size === "sm" ? 12 : 14,
            borderRadius: theme.radii.full,
            backgroundColor: interactionState.pressed ? palette.backgroundPressed : palette.background,
            borderColor: palette.border,
            borderWidth: theme.borderWidth,
            opacity: disabled ? 0.56 : 1,
          },
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
      {chipBody}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "solid",
    overflow: "hidden",
  },
  icon: {
    marginRight: 6,
  },
  removeButton: {
    marginLeft: 6,
    minWidth: 20,
    minHeight: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
