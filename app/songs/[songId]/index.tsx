import { SongHeader } from "@/components/songs/SongHeader";
import { SongSection } from "@/components/songs/SongSection";
import { AppButton, EmptyState, ErrorState, LoadingState, ScreenContainer } from "@/components/ui";
import { APP_ROUTES } from "@/constants/routes";
import { pitchClassToSpelling } from "@/domain/music/conversions";
import { useRecents } from "@/hooks/useRecents";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useSong } from "@/hooks/useSong";
import type { ContentOrigin, EntityRef } from "@/types/music";
import { humanizeSlug } from "@/utils/formatters";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";

function resolveOrigin(value: string | undefined): ContentOrigin {
  return value === "user" ? "user" : "catalog";
}

export default function SongDetailScreen() {
  const navigation = useSafeNavigation();
  const params = useLocalSearchParams<{ songId?: string; origin?: string }>();
  const songId = params.songId ?? "missing";
  const ref = useMemo<EntityRef<"song">>(
    () => ({ type: "song", origin: resolveOrigin(params.origin), id: songId }),
    [params.origin, songId],
  );
  const songState = useSong({ ref });
  const recentsState = useRecents({ initialFilters: { entityType: "song", limit: 1 } });
  const recordedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!songState.song) {
      return;
    }

    const key = `${songState.song.ref.origin}:${songState.song.ref.id}`;
    if (recordedRef.current === key) {
      return;
    }

    recordedRef.current = key;
    void recentsState.recordOpen(songState.song.ref).catch(() => {
      recordedRef.current = null;
    });
  }, [recentsState.recordOpen, songState.song]);

  if (songState.status === "loading") {
    return <ScreenContainer variant="centered"><LoadingState title="Carregando cifra" description="Lendo a versão salva no aparelho…" /></ScreenContainer>;
  }

  if (songState.status === "error") {
    return (
      <ScreenContainer variant="centered">
        <ErrorState
          title="Não foi possível abrir a cifra"
          description="O conteúdo local não foi alterado."
          details={songState.error?.message}
          onActionPress={() => void songState.refresh()}
          secondaryActionLabel="Voltar às cifras"
          onSecondaryActionPress={() => navigation.safeBack(APP_ROUTES.songs)}
        />
      </ScreenContainer>
    );
  }

  if (!songState.song) {
    return (
      <ScreenContainer variant="centered">
        <EmptyState
          title="Cifra não encontrada"
          description="Ela pode ter sido removida ou ainda não está no catálogo local."
          actionLabel="Voltar às cifras"
          onActionPress={() => navigation.safeBack(APP_ROUTES.songs)}
        />
      </ScreenContainer>
    );
  }

  const song = songState.song;
  const keyLabel = song.currentKeyPitchClass === null
    ? "Tom não informado"
    : `Tom ${pitchClassToSpelling(song.currentKeyPitchClass, "contextual")}`;
  const tuningLabel = humanizeSlug(song.tuning.id, "Afinação da cifra");

  return (
    <ScreenContainer scroll>
      <SongHeader
        title={song.title}
        subtitle={song.artist ?? song.composer ?? (song.ref.origin === "user" ? "Cifra pessoal" : "Catálogo local")}
        badges={[
          { label: keyLabel, variant: "note" },
          { label: humanizeSlug(song.arrangementStatus, song.arrangementStatus), variant: "status" },
        ]}
        activeTuningValue={tuningLabel}
        activeTuningDetail="Afinação vinculada ao arranjo"
        onBackPress={() => navigation.safeBack(APP_ROUTES.songs)}
        onActiveTuningPress={() => navigation.push(APP_ROUTES.tunings)}
      />

      <View style={styles.actions}>
        <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.songStage(song.ref.id))}>
          Abrir modo palco
        </AppButton>
        <AppButton fullWidth variant="secondary" onPress={() => navigation.push(APP_ROUTES.songChords(song.ref.id))}>
          Ver acordes usados
        </AppButton>
      </View>

      {song.document.sections.length === 0 ? (
        <EmptyState
          title="Cifra sem seções"
          description="O registro existe, mas ainda não possui linhas musicais salvas."
        />
      ) : (
        <View style={styles.sections}>
          {song.document.sections.map((section) => <SongSection key={section.id} section={section} />)}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ actions: { gap: 10 }, sections: { gap: 12 } });
