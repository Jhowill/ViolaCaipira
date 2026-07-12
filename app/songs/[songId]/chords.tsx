import { APP_ROUTES } from "@/constants/routes";
import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";
import { AppButton, AppCard, Chip } from "@/components/ui";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { humanizeSlug } from "@/utils/formatters";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function SongChordsScreen() {
  const navigation = useSafeNavigation();
  const params = useLocalSearchParams<{ songId?: string }>();
  const songTitle = humanizeSlug(params.songId, "Cifra");

  return (
    <RoutePlaceholder
      eyebrow="Acordes da cifra"
      title={songTitle}
      subtitle="Formas usadas na música e pontos de troca"
      heroTitle="Mapa de acordes"
      heroDescription="Uma visão útil para descobrir quais formas aparecem na cifra e navegar entre elas."
      heroVariant="chord"
      activeTuningValue="Cebolão em Ré"
      activeTuningDetail="Compatível com a cifra aberta"
      primaryActionLabel="Abrir cifra"
      onPrimaryActionPress={() => navigation.safeBack(APP_ROUTES.songDetail(params.songId ?? "romaria-da-serra"))}
    >
      <AppCard
        variant="chord"
        title="Progressão principal"
        subtitle="Exemplo visual"
        description="G • D • Em • C"
      >
        <View style={styles.chipRow}>
          {["G", "D", "Em", "C"].map((chord) => (
            <Chip key={chord} label={chord} variant="chord" />
          ))}
        </View>
      </AppCard>

      <AppCard
        variant="informative"
        title="Alternativas encontradas"
        description="Os próximos ciclos podem listar variações verificadas e calculadas separadamente."
        footer={
          <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.chords)} variant="secondary">
            Ver biblioteca de acordes
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
