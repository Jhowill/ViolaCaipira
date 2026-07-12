import { APP_ROUTES } from "@/constants/routes";
import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";
import { AppButton, AppCard, Chip } from "@/components/ui";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { humanizeSlug } from "@/utils/formatters";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function RhythmPracticeScreen() {
  const navigation = useSafeNavigation();
  const params = useLocalSearchParams<{ rhythmId?: string }>();
  const rhythmName = humanizeSlug(params.rhythmId, "Prática");

  return (
    <RoutePlaceholder
      eyebrow="Prática de ritmo"
      title={rhythmName}
      subtitle="Sequência guiada para tocar junto com metrônomo"
      heroTitle="Hora de praticar"
      heroDescription="A tela de treino já separa o espaço para BPM, contagem e repetição do ciclo."
      heroVariant="rhythm"
      activeTuningValue="Cebolão em Ré"
      activeTuningDetail="Mão direita em foco"
      primaryActionLabel="Abrir metrônomo"
      onPrimaryActionPress={() => navigation.push(APP_ROUTES.metronome)}
      secondaryActionLabel="Voltar ao ritmo"
      onSecondaryActionPress={() => navigation.safeBack(APP_ROUTES.rhythmDetail(params.rhythmId ?? "cururu"))}
    >
      <AppCard
        variant="selected"
        title="Ciclo atual"
        subtitle="Passo 2 de 4"
        description="Baixo • Cima • Abafa • Pausa"
      >
        <View style={styles.chipRow}>
          <Chip label="72 BPM" variant="status" selected />
          <Chip label="Repetir 3x" variant="tag" />
        </View>
      </AppCard>

      <AppCard
        variant="informative"
        title="Controle do exercício"
        description="Essa área pode segurar play, pause, reinício e marcação de progresso."
        footer={
          <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.rhythms)} variant="secondary">
            Sair da prática
          </AppButton>
        }
      />
    </RoutePlaceholder>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
});
