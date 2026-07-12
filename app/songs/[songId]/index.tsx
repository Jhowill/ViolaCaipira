import { APP_ROUTES } from "@/constants/routes";
import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";
import { AppCard, Chip } from "@/components/ui";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { humanizeSlug } from "@/utils/formatters";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function SongDetailScreen() {
  const navigation = useSafeNavigation();
  const params = useLocalSearchParams<{ songId?: string }>();
  const songTitle = humanizeSlug(params.songId, "Cifra");

  return (
    <RoutePlaceholder
      eyebrow="Cifra"
      title={songTitle}
      subtitle="Detalhes, tom atual e modo palco"
      heroTitle={`${songTitle} pronta para abrir`}
      heroDescription="A tela mantém afinação, tom e ações rápidas juntas para não quebrar o fluxo de estudo."
      heroVariant="music"
      activeTuningValue="Cebolão em Ré"
      activeTuningDetail="Afinação recomendada da cifra"
      heroTag="Retomar leitura"
      primaryActionLabel="Abrir modo palco"
      onPrimaryActionPress={() => navigation.push(APP_ROUTES.songStage(params.songId ?? "romaria-da-serra"))}
      secondaryActionLabel="Ver acordes usados"
      onSecondaryActionPress={() => navigation.push(APP_ROUTES.songChords(params.songId ?? "romaria-da-serra"))}
    >
      <AppCard
        variant="informative"
        title="Resumo rápido"
        subtitle="Informações essenciais da cifra"
        description="Tom G • compasso 2/4 • ritmo Cururu • BPM 72"
        footer={
          <View style={styles.chipRow}>
            <Chip label="Offline" variant="status" />
            <Chip label="Favorita" variant="selection" selected />
          </View>
        }
      />

      <AppCard
        variant="selected"
        title="Seções da música"
        subtitle="Versão inicial"
        description="Introdução, verso, refrão e encerramento já organizados para a próxima etapa."
      >
        <View style={styles.chipRow}>
          {["Intro", "Verso", "Refrão", "Final"].map((section) => (
            <Chip key={section} label={section} variant="tag" />
          ))}
        </View>
      </AppCard>
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
