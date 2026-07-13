import { AppButton, AppCard, Chip } from "@/components/ui";
import { useAppTheme } from "@/hooks/useAppTheme";
import { StyleSheet, Text, View } from "react-native";
import type { MetronomeState } from "@/types/metronome";
import { BeatIndicator } from "@/components/metronome/BeatIndicator";

export interface MetronomeDialProps {
  readonly state: MetronomeState;
  readonly leftHanded?: boolean;
  readonly compact?: boolean;
  readonly onPlayPress?: () => void;
  readonly onPausePress?: () => void;
  readonly onTapPress?: () => void;
  readonly onIncreasePress?: () => void;
  readonly onDecreasePress?: () => void;
  readonly accessibilityLabel?: string;
}

function resolveStatusLabel(status: MetronomeState["status"]): string {
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

function resolveStatusDescription(state: MetronomeState): string {
  switch (state.status) {
    case "counting_in":
      return "Contagem inicial ativada";
    case "playing":
      return state.accentFirstBeat ? "Primeiro tempo acentuado" : "Pulso contínuo";
    case "paused":
      return "Toque para retomar";
    case "stopped":
    default:
      return "Toque para iniciar";
  }
}

function resolveTone(state: MetronomeState): "success" | "warning" | "neutral" {
  if (state.status === "playing" || state.status === "counting_in") {
    return "success";
  }

  if (state.status === "paused") {
    return "warning";
  }

  return "neutral";
}

function resolveMainActionLabel(state: MetronomeState): string {
  return state.status === "playing" || state.status === "counting_in" ? "Pausar" : "Iniciar";
}

function resolveMainActionIcon(state: MetronomeState): string {
  return state.status === "playing" || state.status === "counting_in" ? "Ⅱ" : "▶";
}

export function MetronomeDial({
  state,
  leftHanded = false,
  compact = false,
  onPlayPress,
  onPausePress,
  onTapPress,
  onIncreasePress,
  onDecreasePress,
  accessibilityLabel,
}: MetronomeDialProps) {
  const { theme } = useAppTheme();
  const tone = resolveTone(state);
  const timeSignatureLabel = `${state.timeSignatureNumerator}/${state.timeSignatureDenominator}`;
  const statusLabel = resolveStatusLabel(state.status);
  const statusDescription = resolveStatusDescription(state);
  const ringColor =
    tone === "success"
      ? theme.colors.successSoft
      : tone === "warning"
        ? theme.colors.warningSoft
        : theme.colors.surfaceMuted;
  const ringBorder =
    tone === "success"
      ? theme.colors.success
      : tone === "warning"
        ? theme.colors.warning
        : theme.colors.borderStrong;
  const mainActionLabel = resolveMainActionLabel(state);
  const mainActionIcon = resolveMainActionIcon(state);
  const mainActionHandler =
    state.status === "playing" || state.status === "counting_in"
      ? onPausePress ?? onPlayPress
      : onPlayPress ?? onPausePress;
  const controlButtons = leftHanded
    ? [
        { key: "increase", label: "Aumentar BPM", icon: "+", onPress: onIncreasePress },
        { key: "main", label: `${mainActionLabel} metrônomo`, icon: mainActionIcon, onPress: mainActionHandler },
        { key: "decrease", label: "Diminuir BPM", icon: "−", onPress: onDecreasePress },
      ]
    : [
        { key: "decrease", label: "Diminuir BPM", icon: "−", onPress: onDecreasePress },
        { key: "main", label: `${mainActionLabel} metrônomo`, icon: mainActionIcon, onPress: mainActionHandler },
        { key: "increase", label: "Aumentar BPM", icon: "+", onPress: onIncreasePress },
      ];
  const tapTempoDescription =
    state.tapTempo.bpmCandidate && state.tapTempo.sampleCount > 0
      ? `${state.tapTempo.sampleCount} toques · estimado ${Math.round(state.tapTempo.bpmCandidate)} BPM`
      : "Toque no ritmo desejado";

  return (
    <AppCard
      accessibilityLabel={
        accessibilityLabel ??
        [
          `Metrônomo`,
          `${state.bpm} BPM`,
          timeSignatureLabel,
          statusLabel,
          statusDescription,
        ]
          .filter(Boolean)
          .join(". ")
      }
      fullWidth
      padding={compact ? "md" : "lg"}
      variant="music"
    >
      <View style={styles.root}>
        <View style={styles.headerRow}>
          <Text style={[theme.typography.labelLarge, { color: theme.colors.textMuted, letterSpacing: 1.2 }]}>
            Metrônomo
          </Text>
          <View style={styles.headerChips}>
            <Chip label={timeSignatureLabel} selected size="sm" variant="selection" />
            <Chip label={statusLabel} size="sm" variant="status" />
          </View>
        </View>

        <View style={styles.dialBlock}>
          <View
            style={[
              styles.ring,
              {
                backgroundColor: ringColor,
                borderColor: ringBorder,
                width: compact ? 220 : 300,
                height: compact ? 220 : 300,
              },
            ]}
          >
            <View style={[styles.ringInner, { backgroundColor: theme.colors.background }]} />
            <View style={styles.dialTextBlock}>
              <Text style={[theme.typography.labelLarge, { color: theme.colors.textMuted, letterSpacing: 1.2 }]}>
                Andamento
              </Text>
              <Text style={[theme.typography.music.bpm, { color: theme.colors.primaryPressed, marginTop: 8 }]}>
                {state.bpm}
              </Text>
              <Text style={[theme.typography.labelLarge, { color: theme.colors.textMuted, marginTop: 4 }]}>
                BATIDAS POR MINUTO
              </Text>
            </View>
          </View>
        </View>

        <BeatIndicator
          accentFirstBeat={state.accentFirstBeat}
          beat={state.beat}
          compact
          detailLabel={statusDescription}
          fullWidth
          status={state.status}
          totalBeats={state.timeSignatureNumerator}
          leftHanded={leftHanded}
        />

        <View style={[styles.controlRow, leftHanded ? styles.controlRowReversed : null]}>
          {controlButtons.map((button) => (
            <AppButton
              key={button.key}
              accessibilityLabel={button.label}
              disabled={!button.onPress}
              icon={<Text style={[theme.typography.titleLarge, { color: theme.colors.primaryPressed }]}>{button.icon}</Text>}
              onPress={button.onPress}
              size="md"
              variant={button.key === "main" ? "primary" : "secondary"}
            >
              {button.key === "main" ? mainActionLabel : null}
            </AppButton>
          ))}
        </View>

        <AppCard
          accessibilityLabel="Tap tempo"
          footer={
            <AppButton
              accessibilityLabel="Tap tempo"
              onPress={onTapPress}
              size="md"
              variant="secondary"
            >
              TAP
            </AppButton>
          }
          padding="md"
          title="Tap tempo"
          variant="informative"
        >
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary }]}>
            {tapTempoDescription}
          </Text>
        </AppCard>
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
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 8,
  },
  dialBlock: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "relative",
    borderRadius: 999,
    borderWidth: 16,
    borderStyle: "solid",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  ringInner: {
    position: "absolute",
    left: 18,
    top: 18,
    right: 18,
    bottom: 18,
    borderRadius: 999,
  },
  dialTextBlock: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  controlRowReversed: {
    flexDirection: "row-reverse",
  },
});
