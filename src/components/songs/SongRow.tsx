import { AppCard, Chip } from "@/components/ui";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { ChipVariant } from "@/types/ui";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";

export interface SongRowBadge {
  readonly label: string;
  readonly variant?: ChipVariant;
  readonly selected?: boolean;
  readonly icon?: ReactNode;
}

export interface SongRowProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly badges?: readonly SongRowBadge[];
  readonly favorite?: boolean;
  readonly selected?: boolean;
  readonly compact?: boolean;
  readonly onPress?: () => void;
  readonly onFavoritePress?: () => void;
  readonly onMorePress?: () => void;
  readonly accessibilityLabel?: string;
}

function buildAccessibleLabel(
  title: string,
  subtitle: string | undefined,
  description: string | undefined,
  badges: readonly SongRowBadge[],
) {
  return [title, subtitle, description, ...badges.map((badge) => badge.label)].filter(Boolean).join(". ");
}

export function SongRow({
  title,
  subtitle,
  description,
  badges = [],
  favorite = false,
  selected = false,
  compact = false,
  onPress,
  onFavoritePress,
  onMorePress,
  accessibilityLabel,
}: SongRowProps) {
  const { theme } = useAppTheme();
  const label = accessibilityLabel ?? buildAccessibleLabel(title, subtitle, description, badges);

  const content = (
    <View style={styles.content}>
      <View style={styles.headerRow}>
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
                  marginTop: 4,
                },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
          {description ? (
            <Text
              numberOfLines={compact ? 1 : 2}
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
        </View>

        {onFavoritePress || onMorePress ? (
          <View style={styles.actions}>
            {onFavoritePress ? (
              <Pressable
                accessibilityLabel={favorite ? `Remover ${title} dos favoritos` : `Adicionar ${title} aos favoritos`}
                accessibilityRole="button"
                hitSlop={8}
                onPress={(event: GestureResponderEvent) => {
                  event?.stopPropagation?.();
                  onFavoritePress();
                }}
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    backgroundColor: favorite ? theme.colors.primarySoft : theme.colors.surfaceMuted,
                    borderColor: favorite ? theme.colors.primarySoft : theme.colors.border,
                    borderWidth: theme.borderWidth,
                    opacity: pressed ? 0.82 : 1,
                  },
                ]}
              >
                <Text style={[theme.typography.titleSmall, { color: favorite ? theme.colors.primaryPressed : theme.colors.textPrimary }]}>
                  {favorite ? "♥" : "♡"}
                </Text>
              </Pressable>
            ) : null}

            {onMorePress ? (
              <Pressable
                accessibilityLabel={`Mais opções para ${title}`}
                accessibilityRole="button"
                hitSlop={8}
                onPress={(event: GestureResponderEvent) => {
                  event?.stopPropagation?.();
                  onMorePress();
                }}
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    backgroundColor: theme.colors.surfaceMuted,
                    borderColor: theme.colors.border,
                    borderWidth: theme.borderWidth,
                    opacity: pressed ? 0.82 : 1,
                  },
                ]}
              >
                <Text style={[theme.typography.titleSmall, { color: theme.colors.textPrimary }]}>⋯</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      {badges.length > 0 ? (
        <View style={styles.badgesRow}>
          {badges.map((badge) => (
            <Chip
              key={`${badge.label}-${badge.variant ?? "filter"}`}
              icon={badge.icon}
              label={badge.label}
              selected={badge.selected}
              size="sm"
              variant={badge.variant ?? "selection"}
            />
          ))}
        </View>
      ) : null}
    </View>
  );

  return (
    <AppCard
      accessibilityLabel={label}
      fullWidth
      onPress={onPress}
      padding={compact ? "md" : "lg"}
      selected={selected}
      variant="music"
    >
      {content}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "solid",
    flexShrink: 0,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
