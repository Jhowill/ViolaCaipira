import { transposeChordToken } from "@/domain/songs";
import { pitchClassToSpelling } from "@/domain/music/conversions";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { SongLineDocument, SongSegmentDocumentChord } from "@/types/music";
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";

export type ChordLabelResolver = (
  chord: SongSegmentDocumentChord["chord"],
  segment: SongSegmentDocumentChord,
) => string;

export interface ChordLineProps {
  readonly line: SongLineDocument;
  readonly transposeSemitones?: number;
  readonly resolveChordLabel?: ChordLabelResolver;
  readonly compact?: boolean;
  readonly highlighted?: boolean;
  readonly onChordPress?: (params: {
    readonly chord: SongSegmentDocumentChord["chord"];
    readonly label: string;
    readonly segment: SongSegmentDocumentChord;
  }) => void;
  readonly accessibilityLabel?: string;
}

interface LineChunk {
  readonly id: string;
  chord?: SongSegmentDocumentChord["chord"];
  chordSegment?: SongSegmentDocumentChord;
  text?: string;
  tab?: string;
  breakAfter?: boolean;
}

function defaultChordLabel(chord: SongSegmentDocumentChord["chord"]): string {
  return chord.originalSpelling ?? pitchClassToSpelling(chord.rootPitchClass, "contextual");
}

function buildAccessibleLabel(line: SongLineDocument, transposeSemitones: number | undefined, resolveChordLabel: ChordLabelResolver | undefined) {
  const parts: string[] = [];

  for (const segment of line.segments) {
    if (segment.type === "text") {
      parts.push(segment.text);
      continue;
    }

    if (segment.type === "tab") {
      parts.push(segment.value);
      continue;
    }

    if (segment.type === "chord") {
      const chord = transposeSemitones ? transposeChordToken(segment.chord, transposeSemitones) : segment.chord;
      const label = resolveChordLabel?.(chord, segment) ?? defaultChordLabel(chord);
      parts.push(label);
    }
  }

  return parts.join(" ").trim();
}

function buildChunks(line: SongLineDocument): readonly LineChunk[] {
  const chunks: LineChunk[] = [];
  let activeChunk: LineChunk | null = null;

  for (const segment of line.segments) {
    if (segment.type === "chord") {
      activeChunk = {
        id: segment.id,
        chord: segment.chord,
        chordSegment: segment,
      };
      chunks.push(activeChunk);
      continue;
    }

    if (segment.type === "text") {
      if (activeChunk && activeChunk.text === undefined) {
        activeChunk.text = segment.text;
        continue;
      }

      activeChunk = {
        id: segment.id,
        text: segment.text,
      };
      chunks.push(activeChunk);
      continue;
    }

    if (segment.type === "tab") {
      activeChunk = {
        id: segment.id,
        tab: segment.value,
      };
      chunks.push(activeChunk);
      continue;
    }

    activeChunk = {
      id: segment.id,
      breakAfter: true,
    };
    chunks.push(activeChunk);
  }

  return chunks;
}

function renderChordLabel(
  chunk: LineChunk,
  transposeSemitones: number | undefined,
  resolveChordLabel: ChordLabelResolver | undefined,
  onChordPress: ChordLineProps["onChordPress"],
  theme: ReturnType<typeof useAppTheme>["theme"],
  compact: boolean,
) {
  const chordSegment = chunk.chordSegment;
  const chordSource = chunk.chord;

  if (!chordSource || !chordSegment) {
    return null;
  }

  const chord = transposeSemitones ? transposeChordToken(chordSource, transposeSemitones) : chordSource;
  const label = resolveChordLabel?.(chord, chordSegment) ?? defaultChordLabel(chord);

  if (!onChordPress) {
    return (
      <Text style={[theme.typography.music.chordSymbol, { color: theme.colors.primaryPressed }]}>
        {label}
      </Text>
    );
  }

  return (
    <Pressable
      accessibilityLabel={`Abrir acorde ${label}`}
      accessibilityRole="button"
      hitSlop={6}
      onPress={(event: GestureResponderEvent) => {
        event?.stopPropagation?.();
        onChordPress({
          chord,
          label,
          segment: chordSegment,
        });
      }}
      style={({ pressed }) => [
        styles.chordButton,
        {
          opacity: pressed ? 0.78 : 1,
        },
      ]}
    >
      <Text
        style={[
          compact ? theme.typography.labelLarge : theme.typography.music.chordSymbol,
          {
            color: theme.colors.primaryPressed,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function renderLineContent(
  line: SongLineDocument,
  transposeSemitones: number | undefined,
  resolveChordLabel: ChordLabelResolver | undefined,
  onChordPress: ChordLineProps["onChordPress"],
  compact: boolean,
  highlighted: boolean,
  theme: ReturnType<typeof useAppTheme>["theme"],
) {
  const chunks = buildChunks(line);

  if (line.type === "blank") {
    return <View style={styles.blankLine} />;
  }

  if (line.type === "instruction") {
    const text = line.segments
      .map((segment) => (segment.type === "text" ? segment.text : segment.type === "tab" ? segment.value : ""))
      .join(" ")
      .trim();

    return (
      <Text
        style={[
          theme.typography.bodyMedium,
          {
            color: highlighted ? theme.colors.primaryPressed : theme.colors.textSecondary,
            fontStyle: "italic",
          },
        ]}
      >
        {text}
      </Text>
    );
  }

  return (
    <View style={styles.chunkRow}>
      {chunks.map((chunk) => {
        if (chunk.breakAfter) {
          return <View key={chunk.id} style={styles.lineBreak} />;
        }

        return (
          <View key={chunk.id} style={styles.chunk}>
            <View style={styles.chordSlot}>{renderChordLabel(chunk, transposeSemitones, resolveChordLabel, onChordPress, theme, compact)}</View>
            {chunk.text ? (
              <Text
                style={[
                  compact ? theme.typography.music.songDefault : theme.typography.music.songLarge,
                  {
                    color: highlighted ? theme.colors.primaryPressed : theme.colors.textPrimary,
                    flexShrink: 1,
                  },
                ]}
              >
                {chunk.text}
              </Text>
            ) : chunk.tab ? (
              <Text style={[theme.typography.music.songDefault, { color: theme.colors.textSecondary }]}>{chunk.tab}</Text>
            ) : (
              <Text style={[theme.typography.music.songDefault, { color: "transparent" }]}> </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

export function ChordLine({
  line,
  transposeSemitones,
  resolveChordLabel,
  compact = false,
  highlighted = false,
  onChordPress,
  accessibilityLabel,
}: ChordLineProps) {
  const { theme } = useAppTheme();
  const label = accessibilityLabel ?? buildAccessibleLabel(line, transposeSemitones, resolveChordLabel);

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="text"
      style={[
        styles.root,
        {
          opacity: highlighted ? 1 : 0.98,
          gap: compact ? 6 : 8,
        },
      ]}
    >
      {renderLineContent(line, transposeSemitones, resolveChordLabel, onChordPress, compact, highlighted, theme)}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
  },
  chunkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  chunk: {
    marginRight: 16,
    marginBottom: 8,
    minWidth: 0,
    maxWidth: "100%",
  },
  chordSlot: {
    minHeight: 24,
    justifyContent: "center",
    marginBottom: 2,
  },
  chordButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  lineBreak: {
    flexBasis: "100%",
    height: 0,
  },
  blankLine: {
    minHeight: 16,
  },
});
