import { ReferenceSoundButton } from "@/components/tuning/ReferenceSoundButton";
import { TuningStatusBadge, type TuningStatusBadgeState } from "@/components/tuning/TuningStatusBadge";
import { useAppTheme } from "@/hooks/useAppTheme";
import { pitchClassToSpelling } from "@/domain/music/conversions";
import type { PairType, TuningCourseNumber, TuningStringDetails } from "@/types/music";
import { StyleSheet, Text, View, Pressable, type PressableStateCallbackType, type StyleProp, type ViewStyle } from "react-native";

export type TuningCourseRowVariant = "default" | "readOnly" | "incompatible";
export type TuningCourseRowDensity = "compact" | "standard";

export interface TuningCourseRowProps {
  readonly courseNumber: TuningCourseNumber;
  readonly strings: readonly [TuningStringDetails, TuningStringDetails];
  readonly pairType?: PairType;
  readonly density?: TuningCourseRowDensity;
  readonly variant?: TuningCourseRowVariant;
  readonly selected?: boolean;
  readonly status?: TuningStatusBadgeState;
  readonly cents?: number | null;
  readonly onPress?: () => void;
  readonly onReferencePress?: () => void;
  readonly accessibilityLabel?: string;
  readonly referenceAccessibilityLabel?: string;
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

function formatCourseNumber(courseNumber: TuningCourseNumber): string {
  return `${courseNumber}\u00AA`;
}

function formatStringLabel(stringDetails: TuningStringDetails): string {
  return `${pitchClassToSpelling(stringDetails.pitchClass, "contextual")}${stringDetails.octave}`;
}

function resolvePairTypeLabel(pairType?: PairType): string | null {
  switch (pairType) {
    case "unison":
      return "Uníssono";
    case "octave":
      return "Oitavado";
    case "custom":
      return "Personalizado";
    default:
      return null;
  }
}

function resolveStatusSummary(status?: TuningStatusBadgeState, cents?: number | null): string | null {
  if (!status) {
    return null;
  }

  switch (status) {
    case "tuned":
      return "Afinada";
    case "below":
      return typeof cents === "number" && Number.isFinite(cents)
        ? `Abaixo ${Math.abs(Math.round(cents))}\u00A2`
        : "Abaixo";
    case "above":
      return typeof cents === "number" && Number.isFinite(cents)
        ? `Acima ${Math.abs(Math.round(cents))}\u00A2`
        : "Acima";
    case "incompatible":
      return "Incompatível";
    case "waiting":
    default:
      return "Aguardando";
  }
}

function resolvePalette(
  variant: TuningCourseRowVariant,
  selected: boolean,
  theme: ReturnType<typeof useAppTheme>["theme"],
) {
  if (selected) {
    return {
      background: theme.colors.primarySoft,
      border: theme.colors.primary,
      badgeBackground: theme.colors.primarySoft,
      badgeText: theme.colors.primaryPressed,
      titleText: theme.colors.primaryPressed,
      subtitleText: theme.colors.primaryPressed,
      stateText: theme.colors.primaryPressed,
      actionTone: "default" as const,
    };
  }

  switch (variant) {
    case "readOnly":
      return {
        background: theme.colors.surfaceMuted,
        border: theme.colors.borderStrong,
        badgeBackground: theme.colors.surfaceStrong,
        badgeText: theme.colors.textSecondary,
        titleText: theme.colors.textPrimary,
        subtitleText: theme.colors.textSecondary,
        stateText: theme.colors.textMuted,
        actionTone: "default" as const,
      };
    case "incompatible":
      return {
        background: theme.colors.dangerSoft,
        border: theme.colors.danger,
        badgeBackground: theme.colors.dangerSoft,
        badgeText: theme.colors.danger,
        titleText: theme.colors.danger,
        subtitleText: theme.colors.danger,
        stateText: theme.colors.danger,
        actionTone: "danger" as const,
      };
    case "default":
    default:
      return {
        background: theme.colors.surface,
        border: theme.colors.border,
        badgeBackground: theme.colors.primarySoft,
        badgeText: theme.colors.primaryPressed,
        titleText: theme.colors.textPrimary,
        subtitleText: theme.colors.textSecondary,
        stateText: theme.colors.textSecondary,
        actionTone: "default" as const,
      };
  }
}

export function TuningCourseRow({
  courseNumber,
  strings,
  pairType,
  density = "standard",
  variant = "default",
  selected = false,
  status,
  cents,
  onPress,
  onReferencePress,
  accessibilityLabel,
  referenceAccessibilityLabel,
}: TuningCourseRowProps) {
  const { theme } = useAppTheme();
  const pairTypeLabel = resolvePairTypeLabel(pairType);
  const firstStringLabel = formatStringLabel(strings[0]);
  const secondStringLabel = formatStringLabel(strings[1]);
  const statusSummary = resolveStatusSummary(status, cents);
  const palette = resolvePalette(variant, selected, theme);
  const interactive = Boolean(onPress) && variant === "default";
  const notePairLabel = `${firstStringLabel} \u00B7 ${secondStringLabel}`;
  const rowPaddingVertical = density === "compact" ? 12 : 14;
  const badgeSize = density === "compact" ? 44 : 48;
  const titleStyle = density === "compact" ? theme.typography.titleSmall : theme.typography.titleMedium;

  const rootAccessibilityLabel =
    accessibilityLabel ??
    [
      `Ordem ${formatCourseNumber(courseNumber)}`,
      notePairLabel,
      pairTypeLabel ? `Tipo ${pairTypeLabel}` : null,
      statusSummary ? `Estado ${statusSummary}` : null,
      variant === "readOnly" ? "Somente leitura" : null,
      variant === "incompatible" ? "Incompatível" : null,
    ]
      .filter(Boolean)
      .join(". ");

  const content = (
    <>
      <View
        style={[
          styles.leadingBadge,
          {
            width: badgeSize,
            height: badgeSize,
            borderRadius: density === "compact" ? 14 : 16,
            backgroundColor: palette.badgeBackground,
          },
        ]}
      >
        <Text style={[theme.typography.titleSmall, { color: palette.badgeText }]}>
          {formatCourseNumber(courseNumber)}
        </Text>
      </View>

      <View style={styles.content}>
        <Text
          numberOfLines={1}
          style={[
            titleStyle,
            {
              color: palette.titleText,
            },
          ]}
        >
          {notePairLabel}
        </Text>
        {pairTypeLabel ? (
          <Text
            numberOfLines={1}
            style={[
              theme.typography.bodyMedium,
              {
                color: palette.subtitleText,
                marginTop: 2,
              },
            ]}
          >
            {pairTypeLabel}
          </Text>
        ) : null}
        {statusSummary ? (
          <View style={styles.statusRow}>
            <TuningStatusBadge compact cents={cents} status={status ?? "waiting"} />
          </View>
        ) : null}
        {variant !== "default" && !statusSummary ? (
          <Text
            style={[
              theme.typography.labelSmall,
              {
                color: palette.stateText,
                marginTop: 6,
              },
            ]}
          >
            {variant === "readOnly" ? "Somente leitura" : "Incompatível"}
          </Text>
        ) : null}
      </View>

      {onReferencePress ? (
        <View style={styles.action}>
          <ReferenceSoundButton
            layout="compact"
            tone={palette.actionTone}
            onPress={onReferencePress}
            accessibilityLabel={
              referenceAccessibilityLabel ?? `Tocar referência da ${formatCourseNumber(courseNumber)} ordem`
            }
          />
        </View>
      ) : null}
    </>
  );

  const sharedStyle: ViewStyle = {
    backgroundColor: palette.background,
    borderColor: palette.border,
    borderWidth: theme.borderWidth,
    borderRadius: theme.radii.xl,
    paddingVertical: rowPaddingVertical,
  };

  if (!interactive) {
    return (
      <View
        accessibilityLabel={rootAccessibilityLabel}
        accessibilityRole="text"
        style={[styles.root, sharedStyle]}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={rootAccessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={6}
      onPress={onPress}
      style={(state): StyleProp<ViewStyle> => {
        const interactionState = resolvePressableInteractionState(state);

        return [
          styles.root,
          sharedStyle,
          interactionState.pressed ? { backgroundColor: theme.colors.surfaceRaised } : null,
          interactionState.hovered && !interactionState.pressed
            ? { backgroundColor: theme.colors.surfaceRaised }
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
    borderStyle: "solid",
    overflow: "hidden",
  },
  leadingBadge: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  statusRow: {
    marginTop: 8,
    alignItems: "flex-start",
  },
  action: {
    flexShrink: 0,
  },
});
