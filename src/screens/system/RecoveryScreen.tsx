import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton, AppCard, ScreenContainer } from "@/components/ui";
import { useAppTheme } from "@/hooks/useAppTheme";

export interface RecoveryScreenProps {
  readonly fatal: boolean;
  readonly technicalDetails: string;
  readonly onRetry: () => void;
}

function WarningBadge() {
  const { theme } = useAppTheme();

  return (
    <View
      accessibilityLabel="Aviso"
      accessibilityRole="image"
      style={[
        styles.warningBadge,
        {
          backgroundColor: theme.colors.warningSoft,
        },
      ]}
    >
      <Text style={[theme.typography.displayMedium, { color: theme.colors.textPrimary }]}>⚠</Text>
    </View>
  );
}

export function RecoveryScreen({
  fatal,
  technicalDetails,
  onRetry,
}: RecoveryScreenProps) {
  const { theme } = useAppTheme();
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const title = fatal
    ? "Não foi possível abrir o aplicativo."
    : "Não foi possível preparar o conteúdo local.";

  const description = fatal
    ? "Seus dados pessoais não foram apagados. Tente novamente ou veja as informações técnicas antes de reinstalar."
    : "Seus dados pessoais não foram apagados. Tente novamente e veja as informações técnicas se o problema persistir.";

  const technicalLabel = showTechnicalDetails ? "Ocultar informações técnicas" : "Ver informações técnicas";
  const technicalSummary = useMemo(() => {
    if (!technicalDetails) {
      return "Nenhum detalhe técnico disponível.";
    }

    return technicalDetails;
  }, [technicalDetails]);

  return (
    <ScreenContainer scroll background="default" testID="recovery-screen">
      <View style={styles.root}>
        <View style={styles.hero}>
          <WarningBadge />

          <Text
            style={[
              theme.typography.displayMedium,
              styles.title,
              { color: theme.colors.primary },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              theme.typography.bodyLarge,
              styles.description,
              { color: theme.colors.textSecondary },
            ]}
          >
            {description}
          </Text>
        </View>

        <View style={styles.actions}>
          <AppButton fullWidth onPress={onRetry} variant="primary">
            Tentar novamente
          </AppButton>

          <View style={styles.technicalToggle}>
            <AppButton
              accessibilityLabel={technicalLabel}
              onPress={() => setShowTechnicalDetails((current) => !current)}
              variant="tertiary"
            >
              {technicalLabel}
            </AppButton>
          </View>
        </View>

        {showTechnicalDetails ? (
          <AppCard
            accessibilityLabel="Informações técnicas"
            padding="lg"
            title="Informações técnicas"
            variant="informative"
            description="Toque e segure para copiar este texto."
          >
            <Text
              selectable
              style={[
                theme.typography.bodySmall,
                {
                  color: theme.colors.textMuted,
                  marginTop: 4,
                },
              ]}
            >
              {technicalSummary}
            </Text>
          </AppCard>
        ) : null}

        <AppCard
          accessibilityLabel="Aviso sobre reinstalação"
          description="Reinstalar é a última opção. Exporte seus dados pessoais antes, quando disponível."
          icon={<Text style={[theme.typography.titleSmall, { color: theme.colors.primary }]}>i</Text>}
          padding="lg"
          variant="informative"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "space-between",
    gap: 18,
  },
  hero: {
    alignItems: "center",
    gap: 16,
    paddingTop: 12,
  },
  warningBadge: {
    width: 144,
    height: 144,
    borderRadius: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    maxWidth: 360,
  },
  actions: {
    gap: 12,
  },
  technicalToggle: {
    alignItems: "center",
  },
});
