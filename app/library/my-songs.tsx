import { APP_ROUTES } from "@/constants/routes";
import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";
import { AppButton, AppCard, Chip } from "@/components/ui";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { StyleSheet, View } from "react-native";

const libraryItems = [
  { id: "romaria-da-serra", title: "Romaria da Serra", meta: "Última edição", tone: "G" },
  { id: "canto-da-estrada", title: "Canto da Estrada", meta: "Rascunho", tone: "D" },
] as const;

export default function MySongsScreen() {
  const navigation = useSafeNavigation();

  return (
    <RoutePlaceholder
      eyebrow="Biblioteca"
      title="Minhas cifras"
      subtitle="Seu repertório particular, offline e organizado"
      heroTitle="Catálogo pessoal"
      heroDescription="Esta área guarda as cifras do usuário, com edição, duplicação e exportação preparadas para as próximas tarefas."
      heroVariant="premium"
      heroTag="Conteúdo próprio"
      activeTuningValue="Cebolão em Ré"
      activeTuningDetail="Contexto atual do repertório"
      primaryActionLabel="Criar cifra"
      onPrimaryActionPress={() => navigation.push(APP_ROUTES.createSong)}
      secondaryActionLabel="Importar texto"
      onSecondaryActionPress={() => navigation.push(APP_ROUTES.importSong)}
    >
      <View style={styles.list}>
        {libraryItems.map((item) => (
          <AppCard
            key={item.id}
            variant="interactive"
            padding="lg"
            title={item.title}
            subtitle={item.meta}
            description={`Tom ${item.tone} • disponível no dispositivo`}
            onPress={() => navigation.push(APP_ROUTES.songDetail(item.id))}
            footer={
              <View style={styles.cardFooter}>
                <Chip label="Pessoal" variant="tag" />
                <Chip label="Offline" variant="status" />
              </View>
            }
          />
        ))}
      </View>

      <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.settingsBackup)} variant="secondary">
        Fazer backup local
      </AppButton>
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
