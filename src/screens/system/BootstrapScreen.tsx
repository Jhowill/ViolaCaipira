import { brandColors } from "@/constants/colors";
import { useAppTheme } from "@/hooks/useAppTheme";
import { ScreenContainer } from "@/components/ui";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export interface BootstrapScreenProps {
  readonly phase: "booting" | "checking_database" | "migrating_database" | "restoring_preferences";
}

function ViolaMark() {
  const { theme } = useAppTheme();

  return (
    <View
      accessibilityLabel="Marca Cifras de Viola"
      accessibilityRole="image"
      style={[
        styles.logoPlate,
        {
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          borderColor: "rgba(237, 223, 183, 0.14)",
          borderWidth: theme.borderWidth,
        },
      ]}
    >
      <View style={styles.instrument}>
        <View style={[styles.neck, { backgroundColor: brandColors.copper[500] }]} />
        <View style={[styles.head, { backgroundColor: brandColors.copper[300] }]} />
        <View style={[styles.bodyLeft, { backgroundColor: brandColors.copper[500] }]} />
        <View style={[styles.bodyRight, { backgroundColor: brandColors.copper[600] }]} />
        <View style={[styles.bridge, { backgroundColor: brandColors.straw[200] }]} />
        <View style={[styles.soundHole, { borderColor: brandColors.straw[200] }]} />
        <View style={[styles.string, styles.string1, { backgroundColor: brandColors.straw[200] }]} />
        <View style={[styles.string, styles.string2, { backgroundColor: brandColors.straw[200] }]} />
        <View style={[styles.string, styles.string3, { backgroundColor: brandColors.straw[200] }]} />
      </View>
    </View>
  );
}

function resolveStatusLabel(phase: BootstrapScreenProps["phase"]) {
  switch (phase) {
    case "checking_database":
      return "Verificando o banco local";
    case "migrating_database":
      return "Atualizando o conteúdo local";
    case "restoring_preferences":
      return "Restaurando preferências";
    case "booting":
    default:
      return null;
  }
}

export function BootstrapScreen({ phase }: BootstrapScreenProps) {
  const { theme } = useAppTheme();
  const statusLabel = resolveStatusLabel(phase);

  return (
    <ScreenContainer padded={false} background="default" testID="bootstrap-screen">
      <View
        accessibilityLabel="Preparando o aplicativo"
        accessibilityRole="progressbar"
        style={[styles.root, { backgroundColor: brandColors.green[900] }]}
      >
        <View style={styles.ringLayer}>
          <View
            style={[
              styles.ring,
              {
                borderColor: "rgba(237, 223, 183, 0.12)",
                borderWidth: theme.borderWidth,
              },
            ]}
          />
        </View>

        <View style={styles.content}>
          <ViolaMark />

          <View style={styles.copyBlock}>
            <Text
              style={[
                theme.typography.displayLarge,
                styles.title,
                { color: theme.colors.onPrimary },
              ]}
            >
              Cifras de Viola
            </Text>
            <Text
              style={[
                theme.typography.labelLarge,
                styles.subtitle,
                { color: brandColors.straw[200] },
              ]}
            >
              ACORDES · AFINAÇÕES · BATIDAS
            </Text>
          </View>

          {statusLabel ? (
            <View style={styles.statusRow}>
              {phase === "migrating_database" ? (
                <ActivityIndicator color={brandColors.straw[200]} />
              ) : null}
              <Text
                style={[
                  theme.typography.bodySmall,
                  styles.statusText,
                  { color: brandColors.straw[200] },
                ]}
              >
                {statusLabel}
              </Text>
            </View>
          ) : null}
        </View>

        <Text
          style={[
            theme.typography.bodyMedium,
            styles.offlineNote,
            { color: "rgba(237, 223, 183, 0.78)" },
          ]}
        >
          Conteúdo disponível offline
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  ringLayer: {
    pointerEvents: "none",
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    width: 620,
    height: 620,
    borderRadius: 310,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoPlate: {
    width: 176,
    height: 176,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  instrument: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
  },
  neck: {
    position: "absolute",
    top: 8,
    left: 32,
    width: 16,
    height: 56,
    borderRadius: 8,
  },
  head: {
    position: "absolute",
    top: 2,
    left: 24,
    width: 32,
    height: 14,
    borderRadius: 7,
  },
  bodyLeft: {
    position: "absolute",
    bottom: 4,
    left: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  bodyRight: {
    position: "absolute",
    bottom: 4,
    right: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  bridge: {
    position: "absolute",
    bottom: 16,
    left: 38,
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  soundHole: {
    position: "absolute",
    bottom: 12,
    left: 38,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: brandColors.green[900],
    borderWidth: 2,
  },
  string: {
    position: "absolute",
    top: 18,
    width: 2,
    height: 58,
    borderRadius: 1,
  },
  string1: {
    left: 43,
  },
  string2: {
    left: 48,
  },
  string3: {
    left: 53,
  },
  copyBlock: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    letterSpacing: 3.5,
    textTransform: "uppercase",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  statusText: {
    textAlign: "center",
  },
  offlineNote: {
    position: "absolute",
    right: 24,
    bottom: 28,
    textAlign: "right",
  },
});
