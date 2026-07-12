import { APP_ROUTES } from "@/constants/routes";
import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";
import { AppButton, AppCard, Chip } from "@/components/ui";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { StyleSheet, View } from "react-native";

const favorites = [
  { id: "cebolao-em-re", title: "Cebolão em Ré", description: "Afinação rápida", tone: "D" },
  { id: "romaria-da-serra", title: "Romaria da Serra", description: "Cifra favorita", tone: "G" },
] as const;

export default function FavoritesScreen() {
  const navigation = useSafeNavigation();

  return (
    <RoutePlaceholder
      eyebrow="Favoritos"
      title="Itens mais usados"
      subtitle="Atalhos para o estudo recorrente"
      heroTitle="Acesso rápido"
      heroDescription="O shell separa um bloco para afinações, cifras, ritmos e exercícios favoritados."
      heroVariant="premium"
      heroTag="Favoritos"
      activeTuningValue="Cebolão em Ré"
      activeTuningDetail="Mantido em evidência"
      primaryActionLabel="Ver cifras"
      onPrimaryActionPress={() => navigation.push(APP_ROUTES.songs)}
      secondaryActionLabel="Abrir ritmos"
      onSecondaryActionPress={() => navigation.push(APP_ROUTES.rhythms)}
    >
      <View style={styles.list}>
        {favorites.map((item) => (
          <AppCard
            key={item.id}
            variant="selected"
            padding="lg"
            title={item.title}
            subtitle={item.description}
            description={`Tom ${item.tone} • marcado como favorito`}
            onPress={() => navigation.push(APP_ROUTES.songDetail(item.id))}
            footer={
              <View style={styles.cardFooter}>
                <Chip label="Favorito" variant="status" selected />
                <Chip label="Offline" variant="tag" />
              </View>
            }
          />
        ))}
      </View>

      <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.libraryMySongs)} variant="secondary">
        Abrir biblioteca pessoal
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
