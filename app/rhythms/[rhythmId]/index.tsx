import { APP_ROUTES } from "@/constants/routes";
import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";
import { AppButton, AppCard, Chip } from "@/components/ui";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { humanizeSlug } from "@/utils/formatters";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function RhythmDetailScreen() {
  const navigation = useSafeNavigation();
  const params = useLocalSearchParams<{ rhythmId?: string }>();
  const rhythmName = humanizeSlug(params.rhythmId, "Ritmo");

  return (
    <RoutePlaceholder
      eyebrow="Ritmo"
      title={rhythmName}
      subtitle="Compassos, contagem e sequência visual"
      heroTitle={`${rhythmName} em prática`}
      heroDescription="O shell destaca a contagem, o compasso e a preparação para a página de treino."
      heroVariant="rhythm"
      activeTuningValue="Cebolão em Ré"
      activeTuningDetail="Compatível com a seção de estudos"
      primaryActionLabel="Treinar batida"
      onPrimaryActionPress={() => navigation.push(APP_ROUTES.rhythmPractice(params.rhythmId ?? "cururu"))}
      secondaryActionLabel="Abrir metrônomo"
      onSecondaryActionPress={() => navigation.push(APP_ROUTES.metronome)}
    >
      <AppCard
        variant="rhythm"
        title="Contagem básica"
        subtitle="Exemplo"
        description="1 e 2 e 3 e 4 e"
      >
        <View style={styles.chipRow}>
          {["Baixo", "Cima", "Abafar", "Pausa"].map((step) => (
            <Chip key={step} label={step} variant="note" />
          ))}
        </View>
      </AppCard>

      <AppCard
        variant="informative"
        title="Preparar prática"
        description="A próxima tela pode cronometrar repetições e mostrar o andamento do exercício."
        footer={
          <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.rhythmPractice(params.rhythmId ?? "cururu"))} variant="secondary">
            Abrir treino
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
