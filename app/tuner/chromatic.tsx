import { APP_ROUTES } from "@/constants/routes";
import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";
import { AppCard, Chip } from "@/components/ui";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { StyleSheet, View } from "react-native";

export default function ChromaticTunerScreen() {
  const navigation = useSafeNavigation();

  return (
    <RoutePlaceholder
      eyebrow="Afinador cromático"
      title="Qualquer nota"
      subtitle="Leitura livre e precisa"
      heroTitle="Leitura do sinal"
      heroDescription="O shell reserva o espaço para frequência, oitava e cents sem acionar microfone automaticamente."
      heroVariant="music"
      activeTuningValue="Cebolão em Ré"
      activeTuningDetail="Ainda visível mesmo fora do modo guiado"
      primaryActionLabel="Voltar ao guiado"
      onPrimaryActionPress={() => navigation.push(APP_ROUTES.tunerGuided)}
      secondaryActionLabel="Ouvir referência"
      onSecondaryActionPress={() => navigation.push(APP_ROUTES.tunerReference)}
    >
      <AppCard
        variant="informative"
        title="Frequência estimada"
        subtitle="Exemplo visual"
        description="440.0 Hz • A4 • +3 cents"
      >
        <View style={styles.chipRow}>
          <Chip label="Estável" variant="status" selected />
          <Chip label="Ruído baixo" variant="tag" />
        </View>
      </AppCard>

      <AppCard
        variant="alert"
        title="Sem sinal suficiente"
        description="Quando o som não for confiável, o app deve evitar uma leitura falsa."
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
