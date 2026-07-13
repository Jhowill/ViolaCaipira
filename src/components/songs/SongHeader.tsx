import { ActiveTuningPill } from "@/components/navigation/ActiveTuningPill";
import { Chip } from "@/components/ui";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { ChipVariant } from "@/types/ui";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";

export interface SongHeaderBadge {
  readonly label: string;
  readonly variant?: ChipVariant;
  readonly selected?: boolean;
  readonly icon?: ReactNode;
}

export interface SongHeaderProps {
  readonly eyebrow?: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly badges?: readonly SongHeaderBadge[];
  readonly activeTuningValue?: string;
  readonly activeTuningDetail?: string;
  readonly favorite?: boolean;
  readonly compact?: boolean;
  readonly onBackPress?: () => void;
  readonly onMorePress?: () => void;
  readonly onFavoritePress?: () => void;
  readonly onActiveTuningPress?: () => void;
  readonly accessibilityLabel?: string;
}

function buildAccessibleLabel(
  eyebrow: string | undefined,
  title: string,
  subtitle: string | undefined,
  badges: readonly SongHeaderBadge[],
  activeTuningValue: string | undefined,
) {
  return [eyebrow, title, subtitle, activeTuningValue, ...badges.map((badge) => badge.label)]
    .filter(Boolean)
    .join(". ");
}

function HeaderActionButton({
  accessibilityLabel,
  onPress,
  label,
  backgroundColor,
  color,
}: {
  readonly accessibilityLabel: string;
  readonly onPress: () => void;
  readonly label: string;
  readonly backgroundColor: string;
  readonly color: string;
}) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      onPress={(event: GestureResponderEvent) => {
        event?.stopPropagation?.();
        onPress();
      }}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor,
          borderColor: theme.colors.border,
          borderWidth: theme.borderWidth,
          opacity: pressed ? 0.82 : 1,
        },
      ]}
    >
      <Text style={[theme.typography.titleSmall, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function SongHeader({
  eyebrow = "Cifra",
  title,
  subtitle,
  badges = [],
  activeTuningValue,
  activeTuningDetail,
  favorite = false,
  compact = false,
  onBackPress,
  onMorePress,
  onFavoritePress,
  onActiveTuningPress,
  accessibilityLabel,
}: SongHeaderProps) {
  const { theme } = useAppTheme();
  const label = accessibilityLabel ?? buildAccessibleLabel(eyebrow, title, subtitle, badges, activeTuningValue);

  return (
    <View accessibilityLabel={label} accessibilityRole="header" style={styles.root}>
      <View style={styles.topRow}>
        {onBackPress ? (
          <HeaderActionButton
            accessibilityLabel={`Voltar de ${title}`}
            backgroundColor={theme.colors.surface}
            color={theme.colors.textPrimary}
            label="‹"
            onPress={onBackPress}
          />
        ) : (
          <View style={styles.actionSpacer} />
        )}

        <Text style={[theme.typography.labelLarge, { color: theme.colors.textMuted, textAlign: "center" }]}>
          {eyebrow}
        </Text>

        <View style={styles.actionColumn}>
          {onMorePress ? (
            <HeaderActionButton
              accessibilityLabel={`Mais opções para ${title}`}
              backgroundColor={theme.colors.surface}
              color={theme.colors.textPrimary}
              label="⋯"
              onPress={onMorePress}
            />
          ) : null}
          {onFavoritePress ? (
            <HeaderActionButton
              accessibilityLabel={favorite ? `Remover ${title} dos favoritos` : `Adicionar ${title} aos favoritos`}
              backgroundColor={theme.colors.surface}
              color={favorite ? theme.colors.primaryPressed : theme.colors.textPrimary}
              label={favorite ? "♥" : "♡"}
              onPress={onFavoritePress}
            />
          ) : null}
        </View>
      </View>

      <View style={styles.titleBlock}>
        <Text
          numberOfLines={2}
          style={[
            compact ? theme.typography.headlineMedium : theme.typography.headlineLarge,
            {
              color: theme.colors.primaryPressed,
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
                marginTop: 4,
              },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {badges.length > 0 ? (
        <View style={styles.badgesRow}>
          {badges.map((badge) => (
            <Chip
              key={`${badge.label}-${badge.variant ?? "selection"}`}
              icon={badge.icon}
              label={badge.label}
              selected={badge.selected}
              size="sm"
              variant={badge.variant ?? "status"}
            />
          ))}
        </View>
      ) : null}

      {activeTuningValue ? (
        <View style={styles.tuningBlock}>
          <ActiveTuningPill
            detail={activeTuningDetail}
            onPress={onActiveTuningPress}
            value={activeTuningValue}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    gap: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  actionSpacer: {
    width: 44,
    height: 44,
  },
  actionColumn: {
    gap: 10,
    alignItems: "flex-end",
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "solid",
  },
  titleBlock: {
    gap: 2,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tuningBlock: {
    marginTop: 2,
  },
});
