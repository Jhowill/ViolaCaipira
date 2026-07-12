import { useAppTheme } from "@/hooks/useAppTheme";
import type { AppCardPadding, AppCardProps, AppCardVariant } from "@/types/ui";
import { useMemo } from "react";
import {
  Pressable,
  type PressableStateCallbackType,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

const cardPadding: Record<AppCardPadding, number> = {
  sm: 12,
  md: 16,
  lg: 20,
};

function resolveCardPalette(
  variant: AppCardVariant,
  theme: ReturnType<typeof useAppTheme>["theme"],
) {
  const { colors } = theme;

  switch (variant) {
    case "selected":
      return {
        background: colors.surfaceRaised,
        border: colors.primary,
        accent: colors.primarySoft,
      };
    case "informative":
      return {
        background: colors.surfaceRaised,
        border: colors.border,
        accent: colors.primarySoft,
      };
    case "alert":
      return {
        background: colors.warningSoft,
        border: colors.warning,
        accent: colors.warningSoft,
      };
    case "premium":
      return {
        background: colors.premiumSoft,
        border: colors.premium,
        accent: colors.premiumSoft,
      };
    case "music":
      return {
        background: colors.surface,
        border: colors.borderStrong,
        accent: colors.primarySoft,
      };
    case "chord":
      return {
        background: colors.surface,
        border: colors.primarySoft,
        accent: colors.primarySoft,
      };
    case "rhythm":
      return {
        background: colors.surface,
        border: colors.accentSoft,
        accent: colors.accentSoft,
      };
    case "interactive":
    case "default":
    default:
      return {
        background: colors.surface,
        border: colors.border,
        accent: colors.primarySoft,
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

function renderCardContent(
  title: string | undefined,
  subtitle: string | undefined,
  description: string | undefined,
  children: AppCardProps["children"],
  footer: AppCardProps["footer"],
  theme: ReturnType<typeof useAppTheme>["theme"],
  icon: AppCardProps["icon"],
  palette: ReturnType<typeof resolveCardPalette>,
) {
  return (
    <View style={styles.body}>
      {icon ? (
        <View style={[styles.iconBadge, { backgroundColor: palette.accent }]}>
          {icon}
        </View>
      ) : null}
      {title || subtitle || description ? (
        <View style={styles.textBlock}>
          {title ? <Text style={[theme.typography.titleLarge, { color: theme.colors.textPrimary }]}>{title}</Text> : null}
          {subtitle ? <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary }]}>{subtitle}</Text> : null}
          {description ? <Text style={[theme.typography.bodyMedium, { color: theme.colors.textMuted }]}>{description}</Text> : null}
        </View>
      ) : null}
      {children ? <View style={styles.children}>{children}</View> : null}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

export function AppCard({
  children,
  title,
  subtitle,
  description,
  icon,
  footer,
  variant = "default",
  padding = "md",
  selected = false,
  fullWidth = true,
  disabled = false,
  accessibilityLabel,
  onPress,
  ...pressableProps
}: AppCardProps) {
  const { theme } = useAppTheme();
  const palette = useMemo(
    () => resolveCardPalette(selected ? "selected" : variant, theme),
    [selected, theme, variant],
  );
  const interactive = Boolean(onPress) && !disabled;
  const cardPaddingValue = cardPadding[padding];

  const sharedStyle: ViewStyle = {
    backgroundColor: palette.background,
    borderColor: selected ? theme.colors.primary : palette.border,
    borderWidth: theme.borderWidth,
    borderRadius: theme.radii.lg,
    padding: cardPaddingValue,
    width: fullWidth ? "100%" : undefined,
    alignSelf: fullWidth ? "stretch" : "flex-start",
    overflow: "hidden",
  };

  const pressableStyle = (state: PressableStateCallbackType): StyleProp<ViewStyle> => {
    const { pressed, focused, hovered } = resolvePressableInteractionState(state);

    return [
      styles.card,
      sharedStyle,
      pressed
        ? {
            backgroundColor: theme.colors.surfaceRaised,
          }
        : null,
      hovered && !pressed
        ? {
            backgroundColor: theme.colors.surfaceRaised,
          }
        : null,
      focused
        ? {
            outlineColor: theme.colors.focusRing,
            outlineStyle: "solid",
            outlineWidth: theme.borderWidth + 1,
          }
        : null,
      selected
        ? {
            borderColor: theme.colors.primary,
          }
        : null,
    ];
  };

  const staticStyle = [
    styles.card,
    sharedStyle,
    selected && {
      borderColor: theme.colors.primary,
    },
  ];

  const content = renderCardContent(
    title,
    subtitle,
    description,
    children,
    footer,
    theme,
    icon,
    palette,
  );

  if (!interactive) {
    return <View {...pressableProps} style={staticStyle}>{content}</View>;
  }

  return (
    <Pressable
      {...pressableProps}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={pressableStyle}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderStyle: "solid",
  },
  body: {
    width: "100%",
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  textBlock: {
    width: "100%",
  },
  children: {
    marginTop: 12,
  },
  footer: {
    marginTop: 16,
  },
});
