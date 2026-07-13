import { AppCard, Chip } from "@/components/ui";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { RhythmStepView } from "@/repositories/rhythmRepository";
import { StyleSheet, Text, View } from "react-native";

export type RhythmStepState = "future" | "current" | "completed" | "accented" | "pause";

export interface RhythmStepProps {
  readonly step: RhythmStepView;
  readonly state?: RhythmStepState;
  readonly leftHanded?: boolean;
  readonly compact?: boolean;
  readonly fullWidth?: boolean;
  readonly onPress?: (step: RhythmStepView) => void;
  readonly accessibilityLabel?: string;
}

function resolveDirectionIcon(direction: RhythmStepView["direction"], leftHanded: boolean): string {
  const mirroredDirection =
    direction === "down" ? "up" : direction === "up" ? "down" : direction;

  const effectiveDirection = leftHanded ? mirroredDirection : direction;

  switch (effectiveDirection) {
    case "down":
      return "↓";
    case "up":
      return "↑";
    case "none":
    default:
      return "—";
  }
}

function resolveActionLabel(action: RhythmStepView["action"]): string {
  switch (action) {
    case "strike":
      return "Toque";
    case "mute":
      return "Abafa";
    case "percussion":
      return "Percussão";
    case "rest":
      return "Pausa";
    case "brush":
      return "Leve";
    case "pluck":
    default:
      return "Dedilha";
  }
}

function resolveIntensityLabel(intensity: number): string {
  if (intensity <= 0) {
    return "Pausa";
  }

  if (intensity >= 0.75) {
    return "Forte";
  }

  if (intensity >= 0.45) {
    return "Médio";
  }

  return "Leve";
}

function resolveHandPartLabel(handPart: RhythmStepView["handPart"]): string | null {
  switch (handPart) {
    case "thumb":
      return "Polegar";
    case "index":
      return "Indicador";
    case "middle":
      return "Médio";
    case "ring":
      return "Anelar";
    case "multiple":
      return "Múltiplos";
    case "unspecified":
    default:
      return null;
  }
}

function resolveVariant(state: RhythmStepState): "default" | "informative" | "selected" | "alert" {
  switch (state) {
    case "current":
    case "accented":
      return "selected";
    case "pause":
      return "alert";
    case "completed":
      return "informative";
    case "future":
    default:
      return "default";
  }
}

function resolveStateLabel(state: RhythmStepState): string {
  switch (state) {
    case "current":
      return "Atual";
    case "completed":
      return "Concluído";
    case "accented":
      return "Acentuado";
    case "pause":
      return "Pausa";
    case "future":
    default:
      return "Próximo";
  }
}

function formatRangeLabel(from: number | null, to: number | null): string | null {
  if (from === null && to === null) {
    return null;
  }

  if (from !== null && to !== null) {
    return `Cordas ${from}–${to}`;
  }

  const value = from ?? to;
  return value === null ? null : `Corda ${value}`;
}

export function RhythmStep({
  step,
  state = step.action === "rest" ? "pause" : step.isAccent ? "accented" : "future",
  leftHanded = false,
  compact = false,
  fullWidth = false,
  onPress,
  accessibilityLabel,
}: RhythmStepProps) {
  const { theme } = useAppTheme();
  const title = step.beatLabel ?? String(step.stepOrder);
  const actionLabel = resolveActionLabel(step.action);
  const directionIcon = resolveDirectionIcon(step.direction, leftHanded);
  const intensityLabel = resolveIntensityLabel(step.intensity);
  const handPartLabel = resolveHandPartLabel(step.handPart);
  const rangeLabel = formatRangeLabel(step.stringRangeFrom, step.stringRangeTo);
  const stateLabel = resolveStateLabel(state);
  const hasAccent = step.isAccent || state === "accented";
  const detailParts = [
    step.label,
    intensityLabel,
    rangeLabel,
    handPartLabel,
    stateLabel === "Pausa" ? "Pausa" : null,
  ].filter(Boolean) as string[];

  return (
    <View
      style={[
        !fullWidth
          ? {
              flexGrow: 1,
              flexBasis: compact ? 132 : 152,
              minWidth: compact ? 120 : 140,
            }
          : null,
      ]}
    >
      <AppCard
        accessibilityLabel={
          accessibilityLabel ??
          [
            `Passo ${title}`,
            actionLabel,
            directionIcon === "—" ? "Sem direção" : `Direção ${directionIcon}`,
            detailParts.join(". "),
            hasAccent ? "Acentuado" : null,
          ]
            .filter(Boolean)
            .join(". ")
        }
        fullWidth={fullWidth}
        onPress={onPress ? () => onPress(step) : undefined}
        padding={compact ? "md" : "lg"}
        selected={state === "current" || state === "accented"}
        variant={resolveVariant(state)}
      >
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor:
                    state === "pause"
                      ? theme.colors.warningSoft
                      : state === "current" || state === "accented"
                        ? theme.colors.primarySoft
                        : theme.colors.surfaceMuted,
                },
              ]}
            >
              <Text style={[theme.typography.titleLarge, { color: theme.colors.primaryPressed }]}>
                {directionIcon}
              </Text>
            </View>

            <View style={styles.countBlock}>
              <Text style={[theme.typography.labelLarge, { color: theme.colors.textMuted }]}>Passo</Text>
              <Text style={[theme.typography.headlineSmall, { color: theme.colors.textPrimary, marginTop: 2 }]}>
                {title}
              </Text>
            </View>
          </View>

          <View style={styles.bodyBlock}>
            <Text style={[theme.typography.titleMedium, { color: theme.colors.textPrimary }]}>{actionLabel}</Text>
            <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary, marginTop: 4 }]}>
              {detailParts.join(" · ")}
            </Text>
          </View>

          {!compact ? (
            <View style={styles.footerRow}>
              <Chip label={stateLabel} selected={state === "current" || state === "accented"} size="sm" variant="selection" />
              {step.isAccent ? <Chip label="Acento" selected size="sm" variant="note" /> : null}
              {step.action === "rest" ? <Chip label="Pausa" size="sm" variant="status" /> : null}
            </View>
          ) : null}
        </View>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  countBlock: {
    flex: 1,
    minWidth: 0,
  },
  bodyBlock: {
    gap: 2,
  },
  footerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
