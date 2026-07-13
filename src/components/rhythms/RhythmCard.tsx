import { AppButton, AppCard, Chip } from "@/components/ui";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { RhythmPatternView, RhythmSummary } from "@/repositories/rhythmRepository";
import { StyleSheet, Text, View } from "react-native";
import { RhythmPattern } from "@/components/rhythms/RhythmPattern";

export interface RhythmCardProps {
  readonly rhythm: RhythmSummary;
  readonly previewPattern?: RhythmPatternView | null;
  readonly leftHanded?: boolean;
  readonly compact?: boolean;
  readonly showPreview?: boolean;
  readonly onPress?: () => void;
  readonly onFavoritePress?: () => void;
  readonly accessibilityLabel?: string;
}

function resolveDifficultyLabel(level: RhythmSummary["difficulty"]): string {
  switch (level) {
    case "beginner":
      return "Iniciante";
    case "easy":
      return "Fácil";
    case "intermediate":
      return "Intermediário";
    case "advanced":
    default:
      return "Avançado";
  }
}

export function RhythmCard({
  rhythm,
  previewPattern,
  leftHanded = false,
  compact = false,
  showPreview = true,
  onPress,
  onFavoritePress,
  accessibilityLabel,
}: RhythmCardProps) {
  const { theme } = useAppTheme();
  const pattern = previewPattern ?? rhythm.previewPattern;
  const metadata = [
    rhythm.timeSignatureLabel,
    `${rhythm.bpm} BPM`,
    resolveDifficultyLabel(rhythm.difficulty),
    rhythm.originRegion ?? null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <AppCard
      accessibilityLabel={accessibilityLabel ?? `${rhythm.name}. ${metadata}. ${rhythm.shortDescription}`}
      fullWidth
      onPress={onPress}
      padding={compact ? "md" : "lg"}
      variant="music"
    >
      <View style={styles.root}>
        <View style={styles.headerRow}>
          <View style={styles.titleBlock}>
            <Text style={[theme.typography.titleLarge, { color: theme.colors.textPrimary }]}>{rhythm.name}</Text>
            <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary, marginTop: 4 }]}>
              {metadata}
            </Text>
          </View>

          {onFavoritePress ? (
            <AppButton
              accessibilityLabel={rhythm.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              icon={
                <Text style={[theme.typography.titleLarge, { color: theme.colors.primary }]}>
                  {rhythm.isFavorite ? "♥" : "♡"}
                </Text>
              }
              onPress={onFavoritePress}
              size="md"
              variant="icon"
            />
          ) : null}
        </View>

        {rhythm.shortDescription ? (
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary }]}>
            {rhythm.shortDescription}
          </Text>
        ) : null}

        <View style={styles.tagRow}>
          <Chip label={rhythm.timeSignatureLabel} selected size="sm" variant="selection" />
          <Chip label={`${rhythm.bpm} BPM`} size="sm" variant="tag" />
          <Chip label={resolveDifficultyLabel(rhythm.difficulty)} size="sm" variant="status" />
          {rhythm.originRegion ? <Chip label={rhythm.originRegion} size="sm" variant="note" /> : null}
        </View>

        {showPreview && pattern ? (
          <RhythmPattern
            compact
            currentStepIndex={null}
            leftHanded={leftHanded}
            pattern={pattern}
            showHeader={false}
            showLegend={false}
          />
        ) : null}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
