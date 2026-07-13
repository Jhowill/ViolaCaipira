import { useAppTheme } from "@/hooks/useAppTheme";
import { StyleSheet, Text, View, Pressable, type PressableStateCallbackType, type StyleProp, type ViewStyle } from "react-native";

export type ReferenceSoundButtonLayout = "compact" | "banner";
export type ReferenceSoundButtonTone = "default" | "danger";

export interface ReferenceSoundButtonProps {
  readonly layout?: ReferenceSoundButtonLayout;
  readonly title?: string;
  readonly description?: string;
  readonly tone?: ReferenceSoundButtonTone;
  readonly playing?: boolean;
  readonly disabled?: boolean;
  readonly onPress?: () => void;
  readonly accessibilityLabel?: string;
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

function resolveTonePalette(
  tone: ReferenceSoundButtonTone,
  theme: ReturnType<typeof useAppTheme>["theme"],
) {
  switch (tone) {
    case "danger":
      return {
        border: theme.colors.danger,
        compactBackground: theme.colors.dangerSoft,
        text: theme.colors.danger,
        iconBadge: theme.colors.dangerSoft,
        iconText: theme.colors.danger,
      };
    case "default":
    default:
      return {
        border: theme.colors.border,
        compactBackground: theme.colors.surfaceMuted,
        text: theme.colors.textPrimary,
        iconBadge: theme.colors.primary,
        iconText: theme.colors.onPrimary,
      };
  }
}

function resolveIconSymbol(playing: boolean): string {
  return playing ? "\u23F8" : "\u25B6";
}

export function ReferenceSoundButton({
  layout = "banner",
  title,
  description,
  tone = "default",
  playing = false,
  disabled = false,
  onPress,
  accessibilityLabel,
}: ReferenceSoundButtonProps) {
  const { theme } = useAppTheme();
  const palette = resolveTonePalette(tone, theme);
  const interactive = Boolean(onPress) && !disabled;
  const iconSymbol = resolveIconSymbol(playing);
  const compact = layout === "compact";
  const rootAccessibilityLabel =
    accessibilityLabel ??
    [
      title ?? "Tocar som de referência",
      description ?? null,
    ]
      .filter(Boolean)
      .join(". ");

  const rootStyle = (state: PressableStateCallbackType): StyleProp<ViewStyle> => {
    const interactionState = resolvePressableInteractionState(state);

    return [
      styles.root,
      compact ? styles.rootCompact : styles.rootBanner,
      {
        backgroundColor: compact ? palette.compactBackground : theme.colors.surface,
        borderColor: compact ? palette.border : theme.colors.border,
        borderWidth: theme.borderWidth,
        borderRadius: compact ? theme.radii.lg : theme.radii.xl,
        opacity: disabled ? 0.58 : 1,
      },
      interactionState.pressed ? { backgroundColor: theme.colors.surfaceRaised } : null,
      interactionState.hovered && !interactionState.pressed ? { backgroundColor: theme.colors.surfaceRaised } : null,
      interactionState.focused
        ? {
            outlineColor: theme.colors.focusRing,
            outlineStyle: "solid",
            outlineWidth: theme.borderWidth + 1,
          }
        : null,
    ];
  };

  const compactContent = (
    <Text style={[theme.typography.titleSmall, { color: palette.text }]}>
      {iconSymbol}
    </Text>
  );

  const bannerContent = (
    <>
      <View
        style={[
          styles.iconBadge,
          {
            backgroundColor: palette.iconBadge,
          },
        ]}
      >
        <Text style={[theme.typography.titleSmall, { color: palette.iconText }]}>
          {iconSymbol}
        </Text>
      </View>

      <View style={styles.textBlock}>
        <Text
          numberOfLines={1}
          style={[
            theme.typography.titleMedium,
            {
              color: palette.text,
            },
          ]}
        >
          {title ?? "Sons de referência"}
        </Text>
        {description ? (
          <Text
            numberOfLines={2}
            style={[
              theme.typography.bodyMedium,
              {
                color: theme.colors.textSecondary,
                marginTop: 2,
              },
            ]}
          >
            {description}
          </Text>
        ) : null}
      </View>
    </>
  );

  if (!interactive) {
    return (
      <View
        accessibilityLabel={rootAccessibilityLabel}
        accessibilityRole="text"
        style={[
          styles.staticRoot,
          compact ? styles.rootCompact : styles.rootBanner,
          {
            backgroundColor: compact ? palette.compactBackground : theme.colors.surface,
            borderColor: compact ? palette.border : theme.colors.border,
            borderWidth: theme.borderWidth,
            borderRadius: compact ? theme.radii.lg : theme.radii.xl,
            opacity: disabled ? 0.58 : 1,
          },
        ]}
      >
        {compact ? compactContent : bannerContent}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={rootAccessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: playing }}
      disabled={disabled}
      hitSlop={compact ? 6 : 4}
      onPress={onPress}
      style={rootStyle}
    >
      {compact ? compactContent : bannerContent}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    borderStyle: "solid",
  },
  staticRoot: {
    width: "100%",
  },
  rootCompact: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  rootBanner: {
    width: "100%",
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
});
