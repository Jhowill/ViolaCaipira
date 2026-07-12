import { useAppTheme } from "@/hooks/useAppTheme";
import type { AppHeaderAction, AppHeaderProps } from "@/types/ui";
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

function HeaderActionButton({
  action,
  compact = false,
}: {
  readonly action: AppHeaderAction;
  readonly compact?: boolean;
}) {
  const { theme } = useAppTheme();
  const hasLabel = Boolean(action.label);

  return (
    <Pressable
      accessibilityLabel={action.accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: action.disabled }}
      disabled={action.disabled}
      hitSlop={4}
      onPress={action.onPress}
      style={(state) => {
        const interactionState = resolvePressableInteractionState(state);

        return [
          styles.actionButton,
          {
            minHeight: compact ? 44 : 48,
            minWidth: compact ? 44 : 48,
            borderRadius: theme.radii.full,
            paddingHorizontal: hasLabel ? theme.spacing[3] : 0,
            backgroundColor: interactionState.pressed ? theme.colors.surfaceRaised : theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: theme.borderWidth,
            opacity: action.disabled ? 0.5 : 1,
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
      {action.icon ? <View style={hasLabel ? styles.actionIconWithLabel : styles.actionIcon}>{action.icon}</View> : null}
      {hasLabel ? (
        <Text style={[theme.typography.labelMedium, { color: theme.colors.textPrimary }]}>
          {action.label}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function AppHeader({
  title,
  subtitle,
  eyebrow,
  variant = "default",
  centerTitle,
  onBackPress,
  backAccessibilityLabel = "Voltar",
  primaryAction,
  secondaryAction,
  activeTuningLabel,
  activeTuningValue,
}: AppHeaderProps) {
  const { theme } = useAppTheme();
  const shouldCenterTitle = centerTitle ?? Boolean(onBackPress);
  const hasTrailingActions = Boolean(primaryAction || secondaryAction);
  const titleStyle =
    variant === "compact"
      ? theme.typography.titleLarge
      : shouldCenterTitle
        ? theme.typography.headlineMedium
        : eyebrow
          ? theme.typography.displayMedium
          : theme.typography.headlineLarge;

  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <View style={styles.leadingSlot}>
          {onBackPress ? (
            <Pressable
              accessibilityLabel={backAccessibilityLabel}
              accessibilityRole="button"
              hitSlop={4}
              onPress={onBackPress}
              style={(state) => {
                const interactionState = resolvePressableInteractionState(state);

                return [
                  styles.backButton,
                  {
                    minHeight: 44,
                    minWidth: 44,
                    backgroundColor: interactionState.pressed ? theme.colors.surfaceRaised : theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderWidth: theme.borderWidth,
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
              <Text style={[theme.typography.titleMedium, { color: theme.colors.textPrimary }]}>‹</Text>
            </Pressable>
          ) : shouldCenterTitle ? (
            <View style={styles.slotSpacer} />
          ) : null}
        </View>

        <View style={[styles.titleBlock, shouldCenterTitle && styles.centerTitleBlock]}>
          {eyebrow ? (
            <Text
              style={[
                theme.typography.labelMedium,
                {
                  color: theme.colors.textSecondary,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                },
              ]}
              numberOfLines={1}
            >
              {eyebrow}
            </Text>
          ) : null}
          <Text
            numberOfLines={2}
            style={[
              titleStyle,
              {
                color: theme.colors.textPrimary,
                textAlign: shouldCenterTitle ? "center" : "left",
                marginTop: eyebrow ? 4 : 0,
              },
            ]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={2}
              style={[
                theme.typography.bodyMedium,
                {
                  color: theme.colors.textSecondary,
                  textAlign: shouldCenterTitle ? "center" : "left",
                  marginTop: 4,
                },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.trailingSlot}>
          {secondaryAction ? (
            <View style={styles.trailingAction}>
              <HeaderActionButton action={secondaryAction} compact />
            </View>
          ) : null}
          {primaryAction ? (
            <HeaderActionButton action={primaryAction} compact={variant === "compact"} />
          ) : hasTrailingActions && shouldCenterTitle ? (
            <View style={styles.slotSpacer} />
          ) : null}
        </View>
      </View>

      {activeTuningLabel || activeTuningValue ? (
        <View
          style={[
            styles.tuningPill,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: theme.borderWidth,
            },
          ]}
        >
          <Text style={[theme.typography.labelSmall, { color: theme.colors.textSecondary }]}>
            Afinação ativa
          </Text>
          <Text style={[theme.typography.titleSmall, { color: theme.colors.textPrimary, marginTop: 2 }]}>
            {activeTuningValue ?? activeTuningLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
  },
  leadingSlot: {
    minWidth: 44,
    marginRight: 12,
    justifyContent: "flex-start",
  },
  trailingSlot: {
    minWidth: 44,
    marginLeft: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  titleBlock: {
    flex: 1,
  },
  centerTitleBlock: {
    alignItems: "center",
  },
  backButton: {
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "solid",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "solid",
    overflow: "hidden",
  },
  actionIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconWithLabel: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  trailingAction: {
    marginRight: 8,
  },
  slotSpacer: {
    width: 44,
    height: 44,
  },
  tuningPill: {
    marginTop: 12,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
