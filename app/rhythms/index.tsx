import { APP_ROUTES } from "@/constants/routes";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";
import { AppCard, Chip, SectionHeader } from "@/components/ui";
import { StyleSheet, View } from "react-native";

const rhythms = [
  { id: "cururu", title: "Cururu", tempo: "72 BPM", description: "Base para estudo de abertura e retorno." },
  { id: "catirete", title: "Cateretê", tempo: "88 BPM", description: "Movimento firme com desenho marcado." },
  { id: "toada", title: "Toada", tempo: "64 BPM", description: "Fraseado suave com leitura confortável." },
] as const;

export default function RhythmsScreen() {
  const navigation = useSafeNavigation();

  return (
    <RoutePlaceholder
      eyebrow="Ritmos"
      title="Biblioteca de batidas"
      subtitle="Aprenda o desenho antes de levar para a cifra"
      heroTitle="Ritmo em estudo"
      heroDescription="A estrutura visual já deixa espaço para contagem, direção da mão e forma de treinar com metrônomo."
      heroVariant="rhythm"
      activeTuningValue="Cebolão em Ré"
      activeTuningDetail="Contexto válido para os estudos"
      primaryActionLabel="Abrir prática"
      onPrimaryActionPress={() => navigation.push(APP_ROUTES.rhythmPractice("cururu"))}
      secondaryActionLabel="Abrir metronomo"
      onSecondaryActionPress={() => navigation.push(APP_ROUTES.metronome)}
    >
      <SectionHeader title="Ritmos iniciais" description="Selecione um ritmo para detalhar ou praticar." />

      <View style={styles.list}>
        {rhythms.map((rhythm) => (
          <AppCard
            key={rhythm.id}
            variant="rhythm"
            padding="lg"
            title={rhythm.title}
            subtitle={rhythm.tempo}
            description={rhythm.description}
            onPress={() => navigation.push(APP_ROUTES.rhythmDetail(rhythm.id))}
            footer={
              <View style={styles.cardFooter}>
                <Chip label="Local" variant="status" />
                <Chip label="Leitura acessível" variant="tag" />
              </View>
            }
          />
        ))}
      </View>
    </RoutePlaceholder>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  cardFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
