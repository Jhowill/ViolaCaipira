import { APP_ROUTES } from "@/constants/routes";
import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";
import { AppButton, AppCard, Chip } from "@/components/ui";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { humanizeSlug } from "@/utils/formatters";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function ChordDetailScreen() {
  const navigation = useSafeNavigation();
  const params = useLocalSearchParams<{ shapeId?: string }>();
  const chordName = humanizeSlug(params.shapeId, "Acorde");

  return (
    <RoutePlaceholder
      eyebrow="Acorde"
      title={chordName}
      subtitle="Diagrama, posição e intervalos"
      heroTitle={`${chordName} em destaque`}
      heroDescription="Esta tela reserva o espaço do diagrama completo com a leitura por cinco ordens e por dez cordas."
      heroVariant="chord"
      activeTuningValue="Cebolão em Ré"
      activeTuningDetail="Leitura da forma vinculada à afinação"
      primaryActionLabel="Abrir cifras relacionadas"
      onPrimaryActionPress={() => navigation.push(APP_ROUTES.songs)}
      secondaryActionLabel="Comparar posições"
      onSecondaryActionPress={() => navigation.push(APP_ROUTES.chords)}
    >
      <AppCard
        variant="chord"
        title="Diagrama simplificado"
        subtitle="5 ordens"
        description="x • 0 • 0 • 2 • 3 • 2"
      >
        <View style={styles.chipRow}>
          {["Tônica", "3ª", "5ª", "Pestana"].map((label) => (
            <Chip key={label} label={label} variant="tag" />
          ))}
        </View>
      </AppCard>

      <AppCard
        variant="informative"
        title="Status da forma"
        description="A V1 prioriza formas verificadas e sinaliza as calculadas com clareza."
        footer={
          <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.tuner)} variant="secondary">
            Ajustar afinação ativa
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
