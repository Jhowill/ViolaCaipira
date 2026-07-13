import { AppCard, Chip } from "@/components/ui";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { SongSectionDocument } from "@/types/music";
import { StyleSheet, Text, View } from "react-native";
import { ChordLine, type ChordLabelResolver } from "@/components/songs/ChordLine";

export interface SongSectionProps {
  readonly section: SongSectionDocument;
  readonly transposeSemitones?: number;
  readonly resolveChordLabel?: ChordLabelResolver;
  readonly compact?: boolean;
  readonly showLineNumbers?: boolean;
  readonly onChordPress?: Parameters<typeof ChordLine>[0]["onChordPress"];
  readonly accessibilityLabel?: string;
}

function formatSectionTitle(section: SongSectionDocument): string {
  if (section.label) {
    return section.label;
  }

  switch (section.type) {
    case "intro":
      return "Intro";
    case "verse":
      return "Verso";
    case "pre_chorus":
      return "Pré-refrão";
    case "chorus":
      return "Refrão";
    case "bridge":
      return "Ponte";
    case "solo":
      return "Solo";
    case "outro":
      return "Encerramento";
    case "note":
      return "Nota";
    case "custom":
    default:
      return "Seção";
  }
}

function buildAccessibleLabel(section: SongSectionDocument) {
  const sectionTitle = formatSectionTitle(section);
  return [sectionTitle, section.repeatCount ? `${section.repeatCount}x` : null, `${section.lines.length} linhas`]
    .filter(Boolean)
    .join(". ");
}

export function SongSection({
  section,
  transposeSemitones,
  resolveChordLabel,
  compact = false,
  showLineNumbers = false,
  onChordPress,
  accessibilityLabel,
}: SongSectionProps) {
  const { theme } = useAppTheme();
  const sectionTitle = formatSectionTitle(section);
  const label = accessibilityLabel ?? buildAccessibleLabel(section);

  return (
    <AppCard
      accessibilityLabel={label}
      fullWidth
      padding={compact ? "md" : "lg"}
      variant="music"
    >
      <View style={styles.headerRow}>
        <Text style={[theme.typography.labelLarge, { color: theme.colors.textMuted, letterSpacing: 1.2 }]}>
          {sectionTitle.toUpperCase()}
        </Text>
        {section.repeatCount ? <Chip label={`${section.repeatCount}x`} size="sm" variant="tag" /> : null}
      </View>

      <View style={styles.lines}>
        {section.lines.map((line, index) => (
          <View key={line.id} style={styles.lineWrapper}>
            {showLineNumbers ? (
              <Text style={[theme.typography.labelMedium, { color: theme.colors.textMuted, marginBottom: 2 }]}>
                {index + 1}
              </Text>
            ) : null}

            <ChordLine
              compact={compact}
              line={line}
              onChordPress={onChordPress}
              resolveChordLabel={resolveChordLabel}
              transposeSemitones={transposeSemitones}
            />
          </View>
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  lines: {
    gap: 10,
  },
  lineWrapper: {
    gap: 4,
  },
});
