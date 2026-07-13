import { useAppTheme } from "@/hooks/useAppTheme";
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";

export interface AutoScrollControlProps {
  readonly speedLabel: string;
  readonly running?: boolean;
  readonly onDecreaseTextSize: () => void;
  readonly onSpeedPress?: () => void;
  readonly onTogglePlayback: () => void;
  readonly onIncreaseTextSize: () => void;
  readonly onSettingsPress?: () => void;
  readonly accessibilityLabel?: string;
}

function ControlButton({
  label,
  accessibilityLabel,
  onPress,
  backgroundColor,
  color,
  large = false,
}: {
  readonly label: string;
  readonly accessibilityLabel: string;
  readonly onPress: () => void;
  readonly backgroundColor: string;
  readonly color: string;
  readonly large?: boolean;
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
        styles.button,
        large ? styles.largeButton : null,
        {
          backgroundColor,
          borderColor: theme.colors.border,
          borderWidth: theme.borderWidth,
          opacity: pressed ? 0.84 : 1,
        },
      ]}
    >
      <Text style={[large ? theme.typography.titleLarge : theme.typography.titleMedium, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function AutoScrollControl({
  speedLabel,
  running = false,
  onDecreaseTextSize,
  onSpeedPress,
  onTogglePlayback,
  onIncreaseTextSize,
  onSettingsPress,
  accessibilityLabel,
}: AutoScrollControlProps) {
  const { theme } = useAppTheme();

  return (
    <View
      accessibilityLabel={accessibilityLabel ?? `Controles de palco. Velocidade ${speedLabel}. ${running ? "Em reprodução" : "Pausado"}.`}
      accessibilityRole="toolbar"
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: theme.colors.borderStrong,
          borderWidth: theme.borderWidth,
          borderRadius: 28,
          paddingHorizontal: 12,
          paddingVertical: 12,
        },
      ]}
    >
      <ControlButton
        accessibilityLabel="Diminuir texto"
        backgroundColor={theme.colors.surface}
        color={theme.colors.textPrimary}
        label="A−"
        onPress={onDecreaseTextSize}
      />

      {onSpeedPress ? (
        <ControlButton
          accessibilityLabel={`Ajustar velocidade ${speedLabel}`}
          backgroundColor={theme.colors.surface}
          color={theme.colors.textPrimary}
          label={speedLabel}
          onPress={onSpeedPress}
        />
      ) : (
        <View style={[styles.button, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: theme.borderWidth }]}>
          <Text style={[theme.typography.titleMedium, { color: theme.colors.textPrimary }]}>{speedLabel}</Text>
        </View>
      )}

      <ControlButton
        accessibilityLabel={running ? "Pausar rolagem automática" : "Iniciar rolagem automática"}
        backgroundColor={theme.colors.primarySoft}
        color={theme.colors.primaryPressed}
        large
        label={running ? "⏸" : "▶"}
        onPress={onTogglePlayback}
      />

      <ControlButton
        accessibilityLabel="Aumentar texto"
        backgroundColor={theme.colors.surface}
        color={theme.colors.textPrimary}
        label="A+"
        onPress={onIncreaseTextSize}
      />

      {onSettingsPress ? (
        <ControlButton
          accessibilityLabel="Abrir ajustes do palco"
          backgroundColor={theme.colors.surface}
          color={theme.colors.textPrimary}
          label="⚙"
          onPress={onSettingsPress}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderStyle: "solid",
  },
  button: {
    minWidth: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "solid",
    paddingHorizontal: 14,
    flexShrink: 0,
  },
  largeButton: {
    width: 72,
    minWidth: 72,
  },
});
