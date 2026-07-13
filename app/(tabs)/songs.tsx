import { ActiveTuningPill } from "@/components/navigation/ActiveTuningPill";
import { SongRow } from "@/components/songs/SongRow";
import {
  AppButton,
  AppCard,
  Chip,
  EmptyState,
  ErrorState,
  LoadingState,
  OfflineBadge,
  ScreenContainer,
  SearchField,
  SectionHeader,
} from "@/components/ui";
import { APP_ROUTES } from "@/constants/routes";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useSongs } from "@/hooks/useSongs";
import { useTunings } from "@/hooks/useTunings";
import type { SongFilters } from "@/repositories/songRepository";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type FilterKey = "all" | "favorites" | "personal" | "offline";

const filterOptions: readonly { readonly key: FilterKey; readonly label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "favorites", label: "Favoritas" },
  { key: "personal", label: "Próprias" },
  { key: "offline", label: "Offline" },
];

function filtersFor(key: FilterKey): SongFilters {
  switch (key) {
    case "favorites":
      return { origin: "all", favorite: true };
    case "personal":
      return { origin: "user" };
    case "offline":
    case "all":
    default:
      return { origin: "all" };
  }
}

export default function SongsTabScreen() {
  const navigation = useSafeNavigation();
  const { theme } = useAppTheme();
  const songsState = useSongs({ initialFilters: { origin: "all" } });
  const tuningsState = useTunings();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const activeTuning = tuningsState.tunings.find((tuning) => tuning.isActive);

  const selectFilter = (key: FilterKey) => {
    setActiveFilter(key);
    songsState.setFilters(filtersFor(key));
  };

  return (
    <ScreenContainer scroll background="default">
      <AppCard
        variant="informative"
        padding="md"
        title="Cifras"
        subtitle="Busca, afinação e retorno rápido"
        description="Catálogo oficial e cifras pessoais, sempre consultados no banco local."
        icon={<Text style={[theme.typography.titleSmall, { color: theme.colors.primary }]}>♪</Text>}
      />

      <ActiveTuningPill
        value={activeTuning?.name ?? (tuningsState.status === "loading" ? "Carregando…" : "Não definida")}
        detail={activeTuning ? "Afinação ativa salva localmente" : "Escolha necessária para recursos musicais"}
        onPress={() => navigation.replace(APP_ROUTES.tunings)}
      />

      <SearchField
        value={songsState.query}
        onChangeText={songsState.setQuery}
        placeholder="Buscar cifras"
        onFilterPress={() => selectFilter("all")}
      />

      <View style={styles.filterRow}>
        {filterOptions.map((filter) => (
          <Chip
            key={filter.key}
            label={filter.label}
            onPress={() => selectFilter(filter.key)}
            selected={activeFilter === filter.key}
            variant={activeFilter === filter.key ? "selection" : "filter"}
          />
        ))}
      </View>

      <SectionHeader
        title="Resultados offline"
        description={`${songsState.songs.length} cifra${songsState.songs.length === 1 ? "" : "s"} no filtro atual.`}
      />

      {songsState.status === "loading" ? (
        <LoadingState variant="list" rows={3} title="Carregando cifras" />
      ) : songsState.status === "error" ? (
        <ErrorState
          title="Não foi possível carregar as cifras"
          description="O banco local não foi alterado. Tente novamente."
          details={songsState.error?.message}
          onActionPress={() => void songsState.refresh()}
        />
      ) : songsState.songs.length === 0 ? (
        <EmptyState
          title={songsState.query ? "Nenhuma cifra encontrada" : "Sua biblioteca está vazia"}
          description={songsState.query ? "Revise a busca ou limpe os filtros." : "Crie uma cifra própria ou importe um texto autorizado."}
          actionLabel="Criar cifra"
          onActionPress={() => navigation.push(APP_ROUTES.createSong)}
          secondaryActionLabel="Importar texto"
          onSecondaryActionPress={() => navigation.push(APP_ROUTES.importSong)}
        />
      ) : (
        <View style={styles.list}>
          {songsState.songs.map((song) => (
            <SongRow
              key={`${song.ref.origin}-${song.ref.id}`}
              title={song.title}
              subtitle={song.artist ?? (song.origin === "user" ? "Cifra pessoal" : "Catálogo local")}
              description={[song.keyLabel ? `Tom ${song.keyLabel}` : null, song.tuningLabel, song.rhythmLabel]
                .filter(Boolean)
                .join(" • ")}
              favorite={song.isFavorite}
              badges={[
                { label: "Offline", variant: "status" },
                { label: song.tuningLabel, variant: "selection" },
              ]}
              onPress={() =>
                navigation.push({
                  pathname: "/songs/[songId]",
                  params: { songId: song.ref.id, origin: song.ref.origin },
                })
              }
            />
          ))}
        </View>
      )}

      <View style={styles.actionRow}>
        <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.createSong)} variant="primary">
          Criar cifra
        </AppButton>
        <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.importSong)} variant="secondary">
          Importar texto
        </AppButton>
      </View>

      <OfflineBadge description="Busca, filtros e conteúdo são processados localmente." />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  list: { gap: 12 },
  actionRow: { gap: 10 },
});
