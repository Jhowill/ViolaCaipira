import { APP_ROUTES } from "@/constants/routes";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { AppButton, AppCard, AppHeader, Chip, ScreenContainer } from "@/components/ui";
import { StyleSheet, Text, View } from "react-native";

export default function MetronomeScreen() {
  const navigation = useSafeNavigation();

  return (
    <ScreenContainer scroll background="default">
      <AppHeader
        title="Metrônomo"
        subtitle="Tempo estável, sem depender de rede"
        onBackPress={() => navigation.safeBack(APP_ROUTES.studies)}
      />

      <AppCard
        variant="premium"
        padding="lg"
        title="Painel principal"
        subtitle="Tempo estável, sem depender de rede"
        description="O shell prepara o espaço para BPM, tap tempo e seleção de compasso."
        icon={<Text style={{ fontSize: 22 }}>◔</Text>}
        footer={
          <View style={styles.cardFooter}>
            <AppButton variant="primary" onPress={() => navigation.goHome()}>
              Iniciar
            </AppButton>
            <AppButton variant="secondary" onPress={() => navigation.push(APP_ROUTES.settings)}>
              Ajustes
            </AppButton>
          </View>
        }
      />

      <AppCard
        variant="informative"
        title="BPM atual"
        subtitle="Exemplo visual"
        description="72"
      >
        <View style={styles.chipRow}>
          <Chip label="2/4" variant="selection" selected />
          <Chip label="3/4" variant="tag" />
          <Chip label="4/4" variant="tag" />
          <Chip label="6/8" variant="tag" />
        </View>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  cardFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
});
