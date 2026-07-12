import { useAppTheme } from "@/hooks/useAppTheme";
import type { AppButtonProps, AppButtonSize, AppButtonVariant } from "@/types/ui";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  type PressableStateCallbackType,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

const buttonHeights: Record<AppButtonSize, number> = {
  sm: 40,
  md: 48,
  lg: 56,
};

const buttonPadding: Record<AppButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 20,
};

const buttonRadius: Record<AppButtonSize, number> = {
  sm: 14,
  md: 14,
  lg: 16,
};

function resolveButtonPalette(
  variant: AppButtonVariant,
  colors: ReturnType<typeof useAppTheme>["theme"]["colors"],
) {
  switch (variant) {
    case "secondary":
      return {
        background: colors.surface,
        backgroundPressed: colors.surfaceRaised,
        border: colors.borderStrong,
        text: colors.textPrimary,
        spinner: colors.primary,
      };
    case "tertiary":
      return {
        background: "transparent",
        backgroundPressed: colors.backgroundSubtle,
        border: "transparent",
        text: colors.primary,
        spinner: colors.primary,
      };
    case "destructive":
      return {
        background: colors.danger,
        backgroundPressed: colors.danger,
        border: colors.danger,
        text: colors.onPrimary,
        spinner: colors.onPrimary,
      };
    case "icon":
      return {
        background: colors.surface,
        backgroundPressed: colors.surfaceRaised,
        border: colors.borderStrong,
        text: colors.textPrimary,
        spinner: colors.primary,
      };
    case "floating":
      return {
        background: colors.primary,
        backgroundPressed: colors.primaryPressed,
        border: colors.primary,
        text: colors.onPrimary,
        spinner: colors.onPrimary,
      };
    case "primary":
    default:
      return {
        background: colors.primary,
        backgroundPressed: colors.primaryPressed,
        border: colors.primary,
        text: colors.onPrimary,
        spinner: colors.onPrimary,
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

function resolveButtonTextStyle(
  size: AppButtonSize,
  colors: ReturnType<typeof useAppTheme>["theme"]["colors"],
  typography: ReturnType<typeof useAppTheme>["theme"]["typography"],
  variant: AppButtonVariant,
) {
  return [
    size === "sm" ? typography.labelMedium : typography.labelLarge,
    {
      color: variant === "secondary" || variant === "tertiary" || variant === "icon"
        ? colors.textPrimary
        : colors.onPrimary,
    },
  ];
}

export function AppButton({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  fullWidth = false,
  loading = false,
  success = false,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  onPress,
  ...pressableProps
}: AppButtonProps) {
  const { theme } = useAppTheme();
  const palette = useMemo(() => resolveButtonPalette(variant, theme.colors), [theme.colors, variant]);
  const buttonSize = variant === "icon" ? Math.max(buttonHeights[size], 44) : buttonHeights[size];
  const buttonPaddingX = variant === "icon" ? 0 : buttonPadding[size];
  const buttonRadiusValue = variant === "floating" ? theme.radii.full : variant === "icon" ? theme.radii.full : buttonRadius[size];
  const isDisabled = disabled || loading;
  const isSuccessState = success && !isDisabled;

  const backgroundColor =
    isSuccessState && (variant === "primary" || variant === "floating")
      ? theme.colors.success
      : palette.background;
  const pressedBackgroundColor =
    isSuccessState && (variant === "primary" || variant === "floating")
      ? theme.colors.success
      : palette.backgroundPressed;
  const borderColor =
    isSuccessState && variant !== "tertiary" ? theme.colors.success : palette.border;
  const spinnerColor = isSuccessState && (variant === "primary" || variant === "floating") ? theme.colors.onPrimary : palette.spinner;

  const rootStyle = (state: PressableStateCallbackType): StyleProp<ViewStyle> => {
    const { pressed, focused, hovered } = resolvePressableInteractionState(state);

    return [
      styles.base,
      {
        minHeight: buttonSize,
        minWidth: variant === "icon" ? buttonSize : undefined,
        width: variant === "icon" ? buttonSize : undefined,
        paddingHorizontal: buttonPaddingX,
        borderRadius: buttonRadiusValue,
        backgroundColor: pressed ? pressedBackgroundColor : backgroundColor,
        borderColor,
        borderWidth: theme.borderWidth,
        alignSelf: fullWidth ? "stretch" : "flex-start",
        opacity: isDisabled ? 0.58 : 1,
      },
      variant === "floating" ? styles.floating : null,
      hovered && !pressed
        ? {
            backgroundColor: variant === "tertiary" ? theme.colors.backgroundSubtle : backgroundColor,
          }
        : null,
      focused
        ? {
            outlineColor: theme.colors.focusRing,
            outlineStyle: "solid",
            outlineWidth: theme.borderWidth + 1,
          }
        : null,
    ];
  };

  const content = (
    <View style={[styles.content, fullWidth && styles.fullWidth]}>
      {icon && iconPosition === "left" ? <View style={styles.iconLeft}>{icon}</View> : null}
      {children !== undefined && children !== null ? (
        typeof children === "string" || typeof children === "number" ? (
          <Text style={resolveButtonTextStyle(size, theme.colors, theme.typography, variant)} numberOfLines={1}>
            {children}
          </Text>
        ) : (
          <View style={styles.customContent}>{children}</View>
        )
      ) : null}
      {icon && iconPosition === "right" ? <View style={styles.iconRight}>{icon}</View> : null}
    </View>
  );

  return (
    <Pressable
      {...pressableProps}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? (typeof children === "string" ? children : undefined)}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      android_ripple={
        Platform.OS === "android" && !isDisabled
          ? { color: variant === "primary" ? theme.colors.primarySoft : theme.colors.backgroundSubtle }
          : undefined
      }
      disabled={isDisabled}
      hitSlop={variant === "icon" ? 4 : 6}
      onPress={onPress}
      style={rootStyle}
    >
      {() => (
        <View style={styles.pressableSurface}>
          <View style={[styles.contentRow, loading && styles.loadingContent, fullWidth && styles.fullWidth]}>
            {content}
          </View>
          {loading ? (
            <View style={styles.loadingOverlay} pointerEvents="none">
              <ActivityIndicator color={spinnerColor} size="small" />
            </View>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderStyle: "solid",
    overflow: "hidden",
    justifyContent: "center",
  },
  floating: {
    width: 56,
    height: 56,
  },
  pressableSurface: {
    flex: 1,
    justifyContent: "center",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  customContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  fullWidth: {
    width: "100%",
  },
  loadingContent: {
    opacity: 0,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
});
