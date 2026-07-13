import { ChordStatusBadge, type ChordStatusBadgeProps } from "@/components/chords/ChordStatusBadge";
import { useAppTheme } from "@/hooks/useAppTheme";
import { StyleSheet, Text, View, Pressable, type PressableStateCallbackType, type StyleProp, type ViewStyle } from "react-native";
import type { ReactNode } from "react";

export type ChordCardBadge = Pick<ChordStatusBadgeProps, "label" | "tone" | "icon">;

export interface ChordCardProps {
  readonly symbol: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly badges?: readonly ChordCardBadge[];
  readonly diagram?: ReactNode;
  readonly compact?: boolean;
  readonly selected?: boolean;
  readonly favorite?: boolean;
  readonly onPress?: () => void;
  readonly onFavoritePress?: () => void;
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

export function ChordCard({
  symbol,
  title,
  subtitle,
  description,
  badges = [],
  diagram,
  compact = false,
  selected = false,
  favorite = false,
  onPress,
  onFavoritePress,
  accessibilityLabel,
}: ChordCardProps) {
  const { theme } = useAppTheme();
  const interactive = Boolean(onPress);

  const header = (
    <>
      <View
        style={[
          styles.symbolBadge,
          {
            width: compact ? 68 : 78,
            minHeight: compact ? 68 : 78,
            borderRadius: theme.radii.lg,
            backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surfaceMuted,
          },
        ]}
      >
        <Text style={[theme.typography.music.chordDetail, { color: theme.colors.primaryPressed }]}>
          {symbol}
        </Text>
      </View>

      <View style={styles.textBlock}>
        <Text numberOfLines={1} style={[theme.typography.titleLarge, { color: theme.colors.textPrimary }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={[
              theme.typography.bodyMedium,
              {
                color: theme.colors.textSecondary,
                marginTop: 2,
              },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
        {description ? (
          <Text
            numberOfLines={2}
            style={[
              theme.typography.bodyMedium,
              {
                color: theme.colors.textMuted,
                marginTop: 4,
              },
            ]}
          >
            {description}
          </Text>
        ) : null}
        {badges.length > 0 ? (
          <View style={styles.badgesRow}>
            {badges.map((badge) => (
              <ChordStatusBadge
                key={`${badge.label}-${badge.tone ?? "neutral"}`}
                compact
                icon={badge.icon}
                label={badge.label}
                tone={badge.tone}
              />
            ))}
          </View>
        ) : null}
      </View>

      {onFavoritePress ? (
        <Pressable
          accessibilityLabel={favorite ? `Remover ${title} dos favoritos` : `Adicionar ${title} aos favoritos`}
          accessibilityRole="button"
          hitSlop={6}
          onPress={onFavoritePress}
          style={(state) => {
            const interactionState = resolvePressableInteractionState(state);

            return [
              styles.favoriteButton,
              {
                backgroundColor: theme.colors.surfaceMuted,
                borderColor: theme.colors.border,
                borderWidth: theme.borderWidth,
                opacity: interactionState.pressed ? 0.8 : 1,
              },
              interactionState.hovered && !interactionState.pressed ? { backgroundColor: theme.colors.surfaceRaised } : null,
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
          <Text style={[theme.typography.titleMedium, { color: theme.colors.primary }]}>
            {favorite ? "\u2665" : "\u2661"}
          </Text>
        </Pressable>
      ) : null}
    </>
  );

  const sharedStyle: ViewStyle = {
    backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
    borderColor: selected ? theme.colors.primary : theme.colors.border,
    borderWidth: theme.borderWidth,
    borderRadius: theme.radii.xl,
  };

  const rootContent = (
    <>
      <View style={styles.headerRow}>{header}</View>
      {diagram ? <View style={styles.diagramRow}>{diagram}</View> : null}
    </>
  );

  const accessible = accessibilityLabel ?? [symbol, title, subtitle, description].filter(Boolean).join(". ");

  if (!interactive) {
    return (
      <View accessibilityLabel={accessible} accessibilityRole="text" style={[styles.root, sharedStyle]}>
        {rootContent}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={accessible}
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
      {rootContent}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderStyle: "solid",
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  symbolBadge: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderStyle: "solid",
  },
  diagramRow: {
    marginTop: 12,
  },
});
