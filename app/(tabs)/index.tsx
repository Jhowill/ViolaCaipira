import { ActiveTuningPill } from "@/components/navigation/ActiveTuningPill";
import { AppButton, AppCard, AppHeader, Chip, OfflineBadge, ScreenContainer, SectionHeader } from "@/components/ui";
import { APP_ROUTES } from "@/constants/routes";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useRecents } from "@/hooks/useRecents";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useSongs } from "@/hooks/useSongs";
import { useTunings } from "@/hooks/useTunings";
import { StyleSheet, Text, View } from "react-native";

const shortcutCards = [
  { label: "Cifras", subtitle: "Retome sua última música", icon: "♪", onPress: APP_ROUTES.songs },
  { label: "Acordes", subtitle: "Formas e diagramas", icon: "◫", onPress: APP_ROUTES.chords },
  { label: "Afinador", subtitle: "Guiado por afinação", icon: "◉", onPress: APP_ROUTES.tuner },
  { label: "Estudos", subtitle: "Ritmo, metrônomo e treino", icon: "✦", onPress: APP_ROUTES.studies },
  { label: "Ritmos", subtitle: "Catálogo de levadas", icon: "≈", onPress: APP_ROUTES.rhythms },
  { label: "Configurações", subtitle: "Aparência e backup", icon: "⚙", onPress: APP_ROUTES.settings },
] as const;

export default function HomeScreen() {
  const navigation = useSafeNavigation();
  const { theme } = useAppTheme();
  const tuningsState = useTunings();
  const songsState = useSongs({ initialFilters: { origin: "all" } });
  const recentsState = useRecents({ initialFilters: { entityType: "song", limit: 1 } });
  const activeTuning = tuningsState.tunings.find((tuning) => tuning.isActive);
  const recentSongRef = recentsState.recents.find((recent) => recent.ref.type === "song")?.ref;
  const recentSong = recentSongRef
    ? songsState.songs.find((song) => song.ref.id === recentSongRef.id && song.ref.origin === recentSongRef.origin)
    : undefined;
  const tuningValue = activeTuning?.name ?? (tuningsState.status === "loading" ? "Carregando…" : "Não definida");
  const tuningDetail = activeTuning
    ? `${activeTuning.courseLabels.length} ordens • preferência local`
    : "Escolha uma afinação para liberar o modo guiado";

  return (
    <ScreenContainer scroll background="default">
      <AppHeader
        eyebrow="BOM ESTUDO"
        title="Sua viola hoje"
        subtitle="Tudo offline, com o conteúdo salvo no aparelho."
        primaryAction={{
          accessibilityLabel: "Abrir configurações",
          icon: <Text style={{ color: theme.colors.primary }}>⚙</Text>,
          onPress: () => navigation.replace(APP_ROUTES.settings),
        }}
        secondaryAction={{
          accessibilityLabel: "Abrir favoritos",
          icon: <Text style={{ color: theme.colors.primary }}>★</Text>,
          onPress: () => navigation.replace(APP_ROUTES.libraryFavorites),
        }}
      />

      <View style={styles.stack}>
        <ActiveTuningPill
          value={tuningValue}
          detail={tuningDetail}
          onPress={() => navigation.replace(APP_ROUTES.tunings)}
        />

        <AppCard
          variant="music"
          padding="lg"
          title={activeTuning ? "Pronto para afinar?" : "Escolha sua afinação"}
          subtitle={activeTuning ? "A afinação ativa fica sempre visível." : "O modo guiado depende dessa escolha."}
          description={activeTuning
            ? "Comece pelo modo guiado e siga para as demais telas sem perder contexto."
            : "Assim que uma afinação validada estiver no aparelho, você poderá ativá-la aqui."}
          footer={
            <View style={styles.buttonRow}>
              <AppButton
                disabled={!activeTuning}
                onPress={() => navigation.push(APP_ROUTES.tunerGuided)}
                variant="primary"
              >
                Afinar agora
              </AppButton>
              <AppButton onPress={() => navigation.push(APP_ROUTES.tunings)} variant="secondary">
                Escolher afinação
              </AppButton>
            </View>
          }
        />

        <OfflineBadge description="Conteúdo local pronto para uso sem rede." />

        <SectionHeader
          title="Continuar"
          description="Retome a última cifra aberta neste aparelho."
        />

        {recentSong ? (
          <AppCard
            variant="interactive"
            title={recentSong.title}
            subtitle={recentSong.artist ?? "Última cifra aberta"}
            description={[
              recentSong.keyLabel,
              recentSong.rhythmLabel,
              recentSong.tuningLabel,
            ].filter(Boolean).join(" • ")}
            icon={<Text style={[theme.typography.titleSmall, { color: theme.colors.primary }]}>♪</Text>}
            onPress={() => navigation.push({
              pathname: "/songs/[songId]",
              params: { songId: recentSong.ref.id, origin: recentSong.ref.origin },
            })}
          >
            <View style={styles.cardFooter}>
              <Chip label="Disponível offline" variant="status" />
              <Chip label={recentSong.tuningLabel} variant="selection" selected />
            </View>
          </AppCard>
        ) : (
          <AppCard
            variant="interactive"
            title={songsState.status === "loading" || recentsState.status === "loading" ? "Carregando repertório…" : "Nenhuma cifra recente"}
            subtitle="Seu histórico começa no aparelho"
            description="Abra uma cifra da biblioteca para encontrá-la rapidamente aqui."
            icon={<Text style={[theme.typography.titleSmall, { color: theme.colors.primary }]}>♪</Text>}
            onPress={() => navigation.push(APP_ROUTES.songs)}
          />
        )}

        <SectionHeader title="Atalhos" description="Acessos rápidos para o estudo diário." />

        <View style={styles.grid}>
          {shortcutCards.map((card) => (
            <View key={card.label} style={styles.gridItem}>
              <AppCard
                fullWidth={false}
                padding="md"
                title={card.label}
                subtitle={card.subtitle}
                variant="interactive"
                icon={<Text style={[theme.typography.titleSmall, { color: theme.colors.primary }]}>{card.icon}</Text>}
                onPress={() => navigation.push(card.onPress)}
              />
            </View>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 16 },
  buttonRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  cardFooter: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridItem: { width: "48%" },
});
