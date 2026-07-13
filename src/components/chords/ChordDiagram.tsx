import { useAppTheme } from "@/hooks/useAppTheme";
import { pitchClassToSpelling } from "@/domain/music/conversions";
import { resolveChordDiagramLayout } from "@/utils/chordDiagramLayout";
import type { ChordShapeDetails, DiagramMode } from "@/types/music";
import { StyleSheet, Text, View } from "react-native";

export type ChordDiagramDensity = "compact" | "detailed";

export interface ChordDiagramProps {
  readonly shape: ChordShapeDetails;
  readonly mode?: DiagramMode;
  readonly density?: ChordDiagramDensity;
  readonly leftHanded?: boolean;
  readonly showNotes?: boolean;
  readonly showIntervals?: boolean;
  readonly accessibilityLabel?: string;
}

function resolveMarkerPalette(kind: "open" | "muted" | "fretted", theme: ReturnType<typeof useAppTheme>["theme"]) {
  switch (kind) {
    case "muted":
      return {
        border: theme.colors.textSecondary,
        text: theme.colors.textSecondary,
        fill: "transparent",
      };
    case "fretted":
      return {
        border: theme.colors.primary,
        text: theme.colors.onPrimary,
        fill: theme.colors.primary,
      };
    case "open":
    default:
      return {
        border: theme.colors.primary,
        text: theme.colors.primary,
        fill: "transparent",
      };
  }
}

export function ChordDiagram({
  shape,
  mode = "five_courses",
  density = "detailed",
  leftHanded = false,
  showNotes,
  showIntervals,
  accessibilityLabel,
}: ChordDiagramProps) {
  const { theme } = useAppTheme();
  const layout = resolveChordDiagramLayout(shape, { mode, leftHanded });
  const renderNotes = showNotes ?? density === "detailed";
  const renderIntervals = showIntervals ?? density === "detailed";
  const stringCount = layout.strings.length;
  const markerSize = density === "compact" ? 22 : 28;
  const insetPercent = mode === "ten_strings" ? 6 : 8;
  const usableWidthPercent = 100 - insetPercent * 2;
  const stringStepPercent = stringCount > 1 ? usableWidthPercent / (stringCount - 1) : 0;
  const gridTopPercent = layout.usesNut ? (density === "compact" ? 26 : 28) : (density === "compact" ? 22 : 24);
  const gridBottomPercent = renderNotes ? (density === "compact" ? 20 : 22) : (density === "compact" ? 16 : 18);
  const usableHeightPercent = 100 - gridTopPercent - gridBottomPercent;
  const fretStepPercent = layout.fretCount > 0 ? usableHeightPercent / layout.fretCount : usableHeightPercent;
  const markerTopOffsetPercent = density === "compact" ? 7 : 8;
  const captionBottomPercent = density === "compact" ? 4 : 5;

  return (
    <View
      accessibilityLabel={accessibilityLabel ?? layout.accessibilityLabel}
      accessibilityRole="image"
      style={[
        styles.root,
        {
          borderColor: theme.colors.border,
          borderWidth: theme.borderWidth,
          borderRadius: theme.radii.xl,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: density === "compact" ? 12 : 14,
          paddingTop: density === "compact" ? 14 : 16,
          paddingBottom: density === "compact" ? 14 : 16,
        },
      ]}
    >
      {layout.startFret > 1 ? (
        <View style={styles.fretLabelRow}>
          <Text style={[theme.typography.labelSmall, { color: theme.colors.textSecondary }]}>
            {`${layout.startFret}\u00AA casa`}
          </Text>
        </View>
      ) : null}

      <View
        style={[
          styles.board,
          {
            aspectRatio: mode === "ten_strings" ? 0.92 : 0.86,
            minHeight: mode === "ten_strings" ? 260 : 240,
          },
        ]}
      >
        {layout.strings.map((stringEntry, index) => {
          const xPercent = insetPercent + index * stringStepPercent;
          return (
            <View
              key={stringEntry.key}
              style={[
                styles.stringLine,
                {
                  left: `${xPercent}%`,
                  top: `${gridTopPercent}%`,
                  bottom: `${gridBottomPercent}%`,
                  backgroundColor: theme.colors.borderStrong,
                },
              ]}
            />
          );
        })}

        {Array.from({ length: layout.fretCount + 1 }, (_, index) => {
          const topPercent = gridTopPercent + index * fretStepPercent;
          const isNut = index === 0 && layout.usesNut;

          return (
            <View
              key={`fret-${index}`}
              style={[
                styles.fretLine,
                {
                  left: `${insetPercent}%`,
                  right: `${insetPercent}%`,
                  top: `${topPercent}%`,
                  height: isNut ? 4 : 2,
                  backgroundColor: theme.colors.borderStrong,
                },
              ]}
            />
          );
        })}

        {layout.barres.map((barre) => {
          const leftPercent = insetPercent + barre.fromIndex * stringStepPercent;
          const rightPercent = 100 - (insetPercent + barre.toIndex * stringStepPercent);
          const barreTopPercent = gridTopPercent + (barre.fret - layout.startFret + 1 - 0.5) * fretStepPercent;

          return (
            <View
              key={barre.key}
              style={[
                styles.barre,
                {
                  left: `${leftPercent}%`,
                  right: `${rightPercent}%`,
                  top: `${barreTopPercent}%`,
                  height: markerSize * 0.8,
                  borderColor: theme.colors.primaryPressed,
                  backgroundColor: theme.colors.primarySoft,
                  borderRadius: markerSize * 0.4,
                },
              ]}
            >
              <Text style={[theme.typography.labelSmall, { color: theme.colors.primaryPressed }]}>
                {barre.finger}
              </Text>
            </View>
          );
        })}

        {layout.markers.map((marker) => {
          const palette = resolveMarkerPalette(marker.kind, theme);
          const leftPercent = insetPercent + marker.xIndex * stringStepPercent;
          const topPercent =
            marker.kind === "fretted"
              ? gridTopPercent + (marker.fret - layout.startFret + 1 - 0.5) * fretStepPercent
              : gridTopPercent - markerTopOffsetPercent;
          const label = marker.kind === "muted" ? "\u00D7" : marker.kind === "open" ? "\u25CB" : marker.finger ?? "";

          return (
            <View
              key={marker.key}
              accessibilityLabel={`${marker.label} ${marker.kind === "muted" ? "abafada" : marker.kind === "open" ? "solta" : `casa ${marker.fret}`}`}
              accessibilityRole="text"
              style={[
                styles.marker,
                {
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  width: markerSize,
                  height: markerSize,
                  marginLeft: -markerSize / 2,
                  marginTop: -markerSize / 2,
                  borderRadius: markerSize / 2,
                  borderColor: palette.border,
                  backgroundColor: palette.fill,
                },
              ]}
            >
              <Text style={[theme.typography.labelMedium, { color: palette.text }]}>
                {label}
              </Text>
            </View>
          );
        })}

        {renderNotes
          ? layout.strings.map((stringEntry, index) => {
              const xPercent = insetPercent + index * stringStepPercent;
              const noteLabel =
                stringEntry.position.pitchClass !== null && stringEntry.position.octave !== null
                  ? `${pitchClassToSpelling(stringEntry.position.pitchClass, "contextual")}${stringEntry.position.octave}`
                  : stringEntry.label;
              const intervalLabel = stringEntry.position.intervalLabel;

              return (
                <View
                  key={`${stringEntry.key}:caption`}
                  style={[
                    styles.caption,
                    {
                      left: `${xPercent}%`,
                      bottom: `${captionBottomPercent}%`,
                      marginLeft: -24,
                      width: 48,
                    },
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      theme.typography.labelSmall,
                      {
                        color: theme.colors.textSecondary,
                        textAlign: "center",
                      },
                    ]}
                  >
                    {noteLabel}
                  </Text>
                  {renderIntervals && intervalLabel ? (
                    <Text
                      numberOfLines={1}
                      style={[
                        theme.typography.micro,
                        {
                          color: theme.colors.textMuted,
                          textAlign: "center",
                          marginTop: 1,
                        },
                      ]}
                    >
                      {intervalLabel}
                    </Text>
                  ) : null}
                </View>
              );
            })
          : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    overflow: "hidden",
  },
  fretLabelRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 8,
  },
  board: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
  },
  stringLine: {
    position: "absolute",
    width: 2,
  },
  fretLine: {
    position: "absolute",
  },
  marker: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "solid",
  },
  barre: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "solid",
    paddingHorizontal: 8,
    overflow: "hidden",
  },
  caption: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
