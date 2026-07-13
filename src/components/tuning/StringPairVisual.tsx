import { Chip } from "@/components/ui";
import { useAppTheme } from "@/hooks/useAppTheme";
import { pitchClassToSpelling } from "@/domain/music/conversions";
import type { PairType, TuningStringDetails } from "@/types/music";
import { StyleSheet, Text, View } from "react-native";

export type StringPairVisualVariant = "default" | "readOnly" | "incompatible";

export interface StringPairVisualProps {
  readonly strings: readonly [TuningStringDetails, TuningStringDetails];
  readonly pairType?: PairType;
  readonly compact?: boolean;
  readonly variant?: StringPairVisualVariant;
  readonly highlightedStringInCourse?: 1 | 2;
  readonly accessibilityLabel?: string;
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

function resolveStringLabel(stringDetails: TuningStringDetails): string {
  return `${pitchClassToSpelling(stringDetails.pitchClass, "contextual")}${stringDetails.octave}`;
}

function resolveStringDescriptor(
  stringDetails: TuningStringDetails,
  stringIndex: 1 | 2,
): string {
  return `Corda ${stringIndex} ${resolveStringLabel(stringDetails)}`;
}

function resolvePalette(variant: StringPairVisualVariant, theme: ReturnType<typeof useAppTheme>["theme"]) {
  switch (variant) {
    case "readOnly":
      return {
        background: theme.colors.surfaceMuted,
        backgroundHighlighted: theme.colors.surfaceStrong,
        border: theme.colors.borderStrong,
        borderHighlighted: theme.colors.primary,
        primaryText: theme.colors.textPrimary,
        secondaryText: theme.colors.textSecondary,
      };
    case "incompatible":
      return {
        background: theme.colors.dangerSoft,
        backgroundHighlighted: theme.colors.dangerSoft,
        border: theme.colors.danger,
        borderHighlighted: theme.colors.danger,
        primaryText: theme.colors.danger,
        secondaryText: theme.colors.danger,
      };
    case "default":
    default:
      return {
        background: theme.colors.surfaceMuted,
        backgroundHighlighted: theme.colors.primarySoft,
        border: theme.colors.border,
        borderHighlighted: theme.colors.primary,
        primaryText: theme.colors.textPrimary,
        secondaryText: theme.colors.textSecondary,
      };
  }
}

export function StringPairVisual({
  strings,
  pairType,
  compact = false,
  variant = "default",
  highlightedStringInCourse,
  accessibilityLabel,
}: StringPairVisualProps) {
  const { theme } = useAppTheme();
  const pairTypeLabel = resolvePairTypeLabel(pairType);
  const firstStringLabel = resolveStringDescriptor(strings[0], 1);
  const secondStringLabel = resolveStringDescriptor(strings[1], 2);
  const palette = resolvePalette(variant, theme);

  return (
    <View
      accessibilityLabel={
        accessibilityLabel ??
        [
          pairTypeLabel ? `Par ${pairTypeLabel}` : null,
          firstStringLabel,
          secondStringLabel,
          variant === "readOnly" ? "Somente leitura" : null,
          variant === "incompatible" ? "Incompatível" : null,
        ]
          .filter(Boolean)
          .join(". ")
      }
      accessibilityRole="text"
      style={[styles.root, compact ? styles.rootCompact : null]}
    >
      {pairTypeLabel ? (
        <View style={styles.pairTypeRow}>
          <Chip label={pairTypeLabel} size={compact ? "sm" : "md"} variant="tag" />
        </View>
      ) : null}

      <View style={[styles.stringsRow, compact ? styles.stringsRowCompact : null]}>
        {strings.map((stringDetails, index) => {
          const courseIndex = (index + 1) as 1 | 2;
          const isHighlighted = highlightedStringInCourse === courseIndex;
          const noteLabel = resolveStringLabel(stringDetails);

          return (
            <View
              key={stringDetails.id}
              style={[
                styles.stringCard,
                {
                  backgroundColor: isHighlighted
                    ? palette.backgroundHighlighted
                    : palette.background,
                  borderColor: isHighlighted
                    ? palette.borderHighlighted
                    : palette.border,
                  borderRadius: theme.radii.lg,
                  borderWidth: theme.borderWidth,
                  paddingHorizontal: compact ? 10 : 12,
                  paddingVertical: compact ? 8 : 10,
                },
              ]}
            >
              <Text
                style={[
                  theme.typography.labelSmall,
                  {
                    color: isHighlighted ? palette.primaryText : palette.secondaryText,
                  },
                ]}
              >
                {`Corda ${courseIndex}`}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  compact ? theme.typography.titleSmall : theme.typography.titleMedium,
                  {
                    color: isHighlighted ? palette.primaryText : theme.colors.textPrimary,
                    marginTop: 2,
                  },
                ]}
              >
                {noteLabel}
              </Text>
              <Text
                style={[
                  theme.typography.bodySmall,
                  {
                    color: isHighlighted ? palette.secondaryText : theme.colors.textMuted,
                    marginTop: 2,
                  },
                ]}
              >
                {`Posição ${stringDetails.physicalStringNumber}`}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
  },
  rootCompact: {
    gap: 8,
  },
  pairTypeRow: {
    alignItems: "flex-start",
  },
  stringsRow: {
    flexDirection: "row",
    gap: 10,
  },
  stringsRowCompact: {
    gap: 8,
  },
  stringCard: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
  },
});
