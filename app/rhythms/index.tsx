import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";
import { RhythmCard } from "@/components/rhythms/RhythmCard";
import { EmptyState, ErrorState, LoadingState, SearchField, SectionHeader } from "@/components/ui";
import { APP_ROUTES } from "@/constants/routes";
import { useRhythms } from "@/hooks/useRhythms";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useTunings } from "@/hooks/useTunings";
import { StyleSheet, View } from "react-native";

export default function RhythmsScreen() {
  const navigation = useSafeNavigation();
  const rhythmsState = useRhythms();
  const tuningsState = useTunings();
  const featured = rhythmsState.rhythms[0] ?? null;
  const activeTuning = tuningsState.tunings.find((tuning) => tuning.isActive);

  return (
    <RoutePlaceholder
      eyebrow="Ritmos"
      title="Biblioteca de batidas"
      subtitle="Aprenda o desenho antes de levar para a cifra"
      heroTitle={featured?.name ?? "Estudos no seu ritmo"}
      heroDescription={featured?.shortDescription ?? "Os ritmos verificados e seus exercícios aparecem aqui quando o catálogo local estiver disponível."}
      heroVariant="rhythm"
      activeTuningValue={activeTuning?.name ?? (tuningsState.status === "loading" ? "Carregando…" : "Não definida")}
      activeTuningDetail={activeTuning ? "Preferência salva localmente" : "Escolha uma afinação para manter o contexto musical"}
      primaryActionLabel={featured ? "Abrir ritmo em destaque" : "Abrir metrônomo"}
      onPrimaryActionPress={() =>
        featured
          ? navigation.push({
              pathname: "/rhythms/[rhythmId]",
              params: { rhythmId: featured.ref.id, origin: featured.ref.origin },
            })
          : navigation.push(APP_ROUTES.metronome)
      }
      secondaryActionLabel="Abrir metrônomo"
      onSecondaryActionPress={() => navigation.push(APP_ROUTES.metronome)}
    >
      <SearchField
        value={rhythmsState.query}
        onChangeText={rhythmsState.setQuery}
        placeholder="Buscar ritmos"
      />

      <SectionHeader
        title="Ritmos locais"
        description={rhythmsState.rhythms.length === 1 ? "1 ritmo disponível." : `${rhythmsState.rhythms.length} ritmos disponíveis.`}
      />

      {rhythmsState.status === "loading" ? (
        <LoadingState variant="list" rows={3} title="Carregando ritmos" />
      ) : rhythmsState.status === "error" ? (
        <ErrorState
          title="Não foi possível carregar os ritmos"
          description="Os dados locais permanecem intactos."
          details={rhythmsState.error?.message}
          onActionPress={() => void rhythmsState.refresh()}
        />
      ) : rhythmsState.rhythms.length === 0 ? (
        <EmptyState
          title={rhythmsState.query ? "Nenhum ritmo encontrado" : "Catálogo de ritmos ainda vazio"}
          description={rhythmsState.query ? "Tente outro nome ou limpe a busca." : "O app não mostra batidas fictícias como conteúdo definitivo. Use o metrônomo enquanto o catálogo validado não está instalado."}
          actionLabel="Abrir metrônomo"
          onActionPress={() => navigation.push(APP_ROUTES.metronome)}
        />
      ) : (
        <View style={styles.list}>
          {rhythmsState.rhythms.map((rhythm) => (
            <RhythmCard
              key={`${rhythm.ref.origin}-${rhythm.ref.id}`}
              rhythm={rhythm}
              previewPattern={rhythm.previewPattern}
              onPress={() =>
                navigation.push({
                  pathname: "/rhythms/[rhythmId]",
                  params: { rhythmId: rhythm.ref.id, origin: rhythm.ref.origin },
                })
              }
            />
          ))}
        </View>
      )}
    </RoutePlaceholder>
  );
}

const styles = StyleSheet.create({ list: { gap: 12 } });
