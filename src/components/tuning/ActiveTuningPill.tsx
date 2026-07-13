import { TuningStatusBadge, type TuningStatusBadgeState } from "@/components/tuning/TuningStatusBadge";
import { useAppTheme } from "@/hooks/useAppTheme";
import { StyleSheet, Text, View, Pressable, type PressableStateCallbackType, type StyleProp, type ViewStyle } from "react-native";

export type ActiveTuningPillDensity = "compact" | "standard";
export type ActiveTuningPillVariant = "default" | "readOnly" | "incompatible";

export interface ActiveTuningPillProps {
  readonly label?: string;
  readonly value: string;
  readonly detail?: string;
  readonly density?: ActiveTuningPillDensity;
  readonly variant?: ActiveTuningPillVariant;
  readonly status?: TuningStatusBadgeState;
  readonly cents?: number | null;
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

function resolvePalette(
  variant: ActiveTuningPillVariant,
  theme: ReturnType<typeof useAppTheme>["theme"],
) {
  switch (variant) {
    case "readOnly":
      return {
        iconBackground: theme.colors.surfaceMuted,
        iconText: theme.colors.textSecondary,
        labelText: theme.colors.textSecondary,
        titleText: theme.colors.textPrimary,
        detailText: theme.colors.textMuted,
        border: theme.colors.border,
        background: theme.colors.surface,
        chevron: theme.colors.textSecondary,
      };
    case "incompatible":
      return {
        iconBackground: theme.colors.dangerSoft,
        iconText: theme.colors.danger,
        labelText: theme.colors.danger,
        titleText: theme.colors.textPrimary,
        detailText: theme.colors.textSecondary,
        border: theme.colors.danger,
        background: theme.colors.surface,
        chevron: theme.colors.danger,
      };
    case "default":
    default:
      return {
        iconBackground: theme.colors.primarySoft,
        iconText: theme.colors.primary,
        labelText: theme.colors.textSecondary,
        titleText: theme.colors.textPrimary,
        detailText: theme.colors.textMuted,
        border: theme.colors.border,
        background: theme.colors.surface,
        chevron: theme.colors.textSecondary,
      };
  }
}

function resolveIconSymbol(variant: ActiveTuningPillVariant): string {
  if (variant === "incompatible") {
    return "\u26A0";
  }

  return "\u224B";
}

export function ActiveTuningPill({
  label = "Afinação ativa",
  value,
  detail,
  density = "standard",
  variant = "default",
  status,
  cents,
  onPress,
  accessibilityLabel,
}: ActiveTuningPillProps) {
  const { theme } = useAppTheme();
  const palette = resolvePalette(variant, theme);
  const interactive = Boolean(onPress) && variant !== "readOnly";
  const iconSize = density === "compact" ? 36 : 40;
  const iconTextSize = density === "compact" ? 18 : 20;
  const paddingVertical = density === "compact" ? 12 : 14;
  const content = (
    <>
      <View
        style={[
          styles.iconBadge,
          {
            width: iconSize,
            height: iconSize,
            borderRadius: density === "compact" ? 12 : 14,
            backgroundColor: palette.iconBackground,
          },
        ]}
      >
        <Text style={[theme.typography.titleSmall, { color: palette.iconText, fontSize: iconTextSize }]}>
          {resolveIconSymbol(variant)}
        </Text>
      </View>

      <View style={styles.textBlock}>
        <Text
          numberOfLines={1}
          style={[
            theme.typography.labelSmall,
            {
              color: palette.labelText,
              textTransform: "uppercase",
              letterSpacing: 1,
            },
          ]}
        >
          {label}
        </Text>
        <Text
          numberOfLines={1}
          style={[
            density === "compact" ? theme.typography.titleSmall : theme.typography.titleMedium,
            {
              color: palette.titleText,
              marginTop: 2,
            },
          ]}
        >
          {value}
        </Text>
        {detail ? (
          <Text
            numberOfLines={2}
            style={[
              theme.typography.bodySmall,
              {
                color: palette.detailText,
                marginTop: 2,
              },
            ]}
          >
            {detail}
          </Text>
        ) : null}
        {status ? (
          <View style={styles.statusRow}>
            <TuningStatusBadge compact cents={cents} status={status} />
          </View>
        ) : null}
      </View>

      {interactive ? (
        <Text style={[theme.typography.titleMedium, { color: palette.chevron }]}>{"\u203A"}</Text>
      ) : null}
    </>
  );

  const sharedStyle: ViewStyle = {
    backgroundColor: palette.background,
    borderColor: palette.border,
    borderWidth: theme.borderWidth,
    borderRadius: theme.radii.xl,
  };

  const accessibleLabel =
    accessibilityLabel ??
    [
      label,
      value,
      detail ?? null,
      variant === "readOnly" ? "Somente leitura" : null,
      variant === "incompatible" ? "Incompatível" : null,
    ]
      .filter(Boolean)
      .join(". ");

  if (!interactive) {
    return (
      <View accessibilityLabel={accessibleLabel} accessibilityRole="text" style={[styles.root, sharedStyle, { paddingVertical }]}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={accessibleLabel}
      accessibilityRole="button"
      hitSlop={6}
      onPress={onPress}
      style={(state): StyleProp<ViewStyle> => {
        const interactionState = resolvePressableInteractionState(state);

        return [
          styles.root,
          sharedStyle,
          {
            paddingVertical,
            opacity: variant === "incompatible" ? 0.98 : 1,
          },
          interactionState.pressed
            ? {
                backgroundColor: theme.colors.surfaceRaised,
              }
            : null,
          interactionState.hovered && !interactionState.pressed
            ? {
                backgroundColor: theme.colors.surfaceRaised,
              }
            : null,
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
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    overflow: "hidden",
  },
  iconBadge: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  statusRow: {
    marginTop: 8,
    alignItems: "flex-start",
  },
});
