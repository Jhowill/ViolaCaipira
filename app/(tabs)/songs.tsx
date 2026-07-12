import { ActiveTuningPill } from "@/components/navigation/ActiveTuningPill";
import { APP_ROUTES } from "@/constants/routes";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { AppButton, AppCard, Chip, OfflineBadge, ScreenContainer, SearchField, SectionHeader } from "@/components/ui";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const songs = [
  {
    id: "romaria-da-serra",
    title: "Romaria da Serra",
    artist: "Autor fictício",
    tuning: "Cebolão em Ré",
    rhythm: "Cururu",
    key: "G",
  },
  {
    id: "manha-de-folha",
    title: "Manhã de Folha",
    artist: "Coletânea local",
    tuning: "Rio Abaixo",
    rhythm: "Toada",
    key: "D",
  },
  {
    id: "ponteio-do-bom",
    title: "Ponteio do Bom",
    artist: "Composição do usuário",
    tuning: "Boiadeira",
    rhythm: "Moda de viola",
    key: "A",
  },
] as const;

const filters = ["Todos", "Favoritas", "Próprias", "Offline"] as const;

export default function SongsTabScreen() {
  const navigation = useSafeNavigation();
  const { theme } = useAppTheme();
  const [query, setQuery] = useState("");
  const filteredSongs = useMemo(
    () =>
      songs.filter((song) =>
        `${song.title} ${song.artist} ${song.tuning} ${song.rhythm}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <ScreenContainer scroll background="default">
      <View style={styles.headerBlock}>
        <AppCard
          variant="informative"
          padding="md"
          title="Cifras"
          subtitle="Busca, afinação e retorno rápido"
          description="Tudo organizado para você abrir, filtrar e continuar sem depender da internet."
          icon={<Text style={[theme.typography.titleSmall, { color: theme.colors.primary }]}>♪</Text>}
        />
      </View>

      <ActiveTuningPill
        value="Cebolão em Ré"
        detail="Afinação ativa para a lista"
        onPress={() => navigation.replace(APP_ROUTES.tunings)}
      />

      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar cifras"
        onFilterPress={() => navigation.replace(APP_ROUTES.songs)}
      />

      <View style={styles.filterRow}>
        {filters.map((filter, index) => (
          <Chip
            key={filter}
            label={filter}
            selected={index === 0}
            variant={index === 0 ? "selection" : "filter"}
          />
        ))}
      </View>

      <SectionHeader title="Resultados offline" description="Toque em uma cifra para abrir os detalhes." />

      <View style={styles.list}>
        {filteredSongs.map((song) => (
          <AppCard
            key={song.id}
            variant="music"
            padding="lg"
            title={song.title}
            subtitle={song.artist}
            description={`Tom ${song.key} • ${song.tuning} • ${song.rhythm}`}
            onPress={() => navigation.push(APP_ROUTES.songDetail(song.id))}
            footer={
              <View style={styles.cardFooter}>
                <Chip label="Offline" variant="status" />
                <Chip label={song.tuning} variant="selection" />
              </View>
            }
          />
        ))}
      </View>

      <View style={styles.actionRow}>
        <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.createSong)} variant="primary">
          Criar cifra
        </AppButton>
        <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.importSong)} variant="secondary">
          Importar texto
        </AppButton>
      </View>

      <OfflineBadge description="Busca local, filtros locais e catálogo próprio." />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    marginBottom: 4,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  list: {
    gap: 12,
  },
  cardFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionRow: {
    gap: 10,
  },
});
