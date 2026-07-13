import { AppCard, Chip } from "@/components/ui";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { MetronomeBeatState, MetronomeStatus } from "@/types/metronome";
import { StyleSheet, Text, View } from "react-native";

export interface BeatIndicatorProps {
  readonly beat: MetronomeBeatState;
  readonly status: MetronomeStatus;
  readonly totalBeats?: number;
  readonly accentFirstBeat?: boolean;
  readonly label?: string;
  readonly detailLabel?: string;
  readonly compact?: boolean;
  readonly leftHanded?: boolean;
  readonly fullWidth?: boolean;
  readonly onPress?: () => void;
  readonly accessibilityLabel?: string;
}

function resolveStatusLabel(status: MetronomeStatus): string {
  switch (status) {
    case "counting_in":
      return "Contagem";
    case "playing":
      return "Ativo";
    case "paused":
      return "Pausado";
    case "stopped":
    default:
      return "Parado";
  }
}

function resolveTone(status: MetronomeStatus): "success" | "warning" | "neutral" {
  if (status === "playing") {
    return "success";
  }

  if (status === "counting_in") {
    return "warning";
  }

  return "neutral";
}

function resolveBeatLabel(beat: MetronomeBeatState, totalBeats: number | undefined): string {
  const beatIndex = beat.beatInBar ?? beat.barNumber ?? 1;

  if (totalBeats && totalBeats > 1) {
    return `${beatIndex}/${totalBeats}`;
  }

  if (beat.barNumber !== null) {
    return `Compasso ${beat.barNumber}`;
  }

  return `Batida ${beatIndex}`;
}

function resolveIcon(status: MetronomeStatus, isAccentBeat: boolean): string {
  if (status === "paused") {
    return "Ⅱ";
  }

  if (status === "counting_in") {
    return "…";
  }

  if (status === "playing" && isAccentBeat) {
    return "★";
  }

  return "●";
}

export function BeatIndicator({
  beat,
  status,
  totalBeats,
  accentFirstBeat = false,
  label,
  detailLabel,
  compact = false,
  leftHanded = false,
  fullWidth = true,
  onPress,
  accessibilityLabel,
}: BeatIndicatorProps) {
  const { theme } = useAppTheme();
  const isAccentBeat = accentFirstBeat || beat.isAccentBeat;
  const tone = resolveTone(status);
  const beatLabel = resolveBeatLabel(beat, totalBeats);
  const stateLabel = resolveStatusLabel(status);
  const icon = resolveIcon(status, isAccentBeat);
  const palette = {
    success: {
      background: theme.colors.successSoft,
      border: theme.colors.success,
      foreground: theme.colors.success,
    },
    warning: {
      background: theme.colors.warningSoft,
      border: theme.colors.warning,
      foreground: theme.colors.warning,
    },
    neutral: {
      background: theme.colors.surfaceMuted,
      border: theme.colors.border,
      foreground: theme.colors.textSecondary,
    },
  }[tone];

  return (
    <View
      style={[
        !fullWidth
          ? {
              flexGrow: 1,
              flexBasis: compact ? 120 : 160,
              minWidth: compact ? 112 : 140,
            }
          : null,
      ]}
    >
      <AppCard
        accessibilityLabel={
          accessibilityLabel ??
          [
            label ?? "Batida atual",
            beatLabel,
            stateLabel,
            detailLabel,
            isAccentBeat ? "Acento" : null,
          ]
            .filter(Boolean)
            .join(". ")
        }
        fullWidth={fullWidth}
        onPress={onPress}
        padding={compact ? "md" : "lg"}
        variant={tone === "success" ? "selected" : tone === "warning" ? "alert" : "informative"}
      >
        <View style={[styles.root, leftHanded ? styles.leftHanded : null]}>
          <View style={[styles.iconBadge, { backgroundColor: palette.background, borderColor: palette.border }]}>
            <Text style={[theme.typography.headlineSmall, { color: palette.foreground }]}>{icon}</Text>
          </View>

          <View style={styles.textBlock}>
            <Text style={[theme.typography.labelLarge, { color: theme.colors.textMuted, letterSpacing: 1.2 }]}>
              {label ?? "Batida atual"}
            </Text>
            <Text style={[theme.typography.titleLarge, { color: theme.colors.textPrimary, marginTop: 2 }]}>
              {beatLabel}
            </Text>
            <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary, marginTop: 4 }]}>
              {[stateLabel, detailLabel].filter(Boolean).join(" · ")}
            </Text>
          </View>
        </View>

        {!compact ? (
          <View style={styles.footerRow}>
            {isAccentBeat ? <Chip label="Acento" selected size="sm" variant="selection" /> : null}
            {status === "counting_in" ? <Chip label="Contagem" size="sm" variant="status" /> : null}
            {status === "paused" ? <Chip label="Pausado" size="sm" variant="status" /> : null}
          </View>
        ) : null}
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  leftHanded: {
    flexDirection: "row-reverse",
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "solid",
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  footerRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
