import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";
import {
  AppButton,
  AppCard,
  Chip,
  EmptyState,
  ErrorState,
  LoadingState,
  SearchField,
  SectionHeader,
} from "@/components/ui";
import { APP_ROUTES } from "@/constants/routes";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useTunings } from "@/hooks/useTunings";
import { humanizeSlug } from "@/utils/formatters";
import { StyleSheet, View } from "react-native";

export default function TuningsScreen() {
  const navigation = useSafeNavigation();
  const tuningsState = useTunings();
  const active = tuningsState.tunings.find((tuning) => tuning.isActive) ?? null;
  const featured = active ?? tuningsState.tunings[0] ?? null;

  return (
    <RoutePlaceholder
      eyebrow="Afinações"
      title="Escolha a base da viola"
      subtitle="A afinação muda acordes, afinador e repertório"
      heroTitle={featured?.name ?? "Nenhuma afinação instalada"}
      heroDescription={featured ? "Detalhes e origem vêm do banco local, sem conteúdo demonstrativo misturado ao catálogo." : "Instale ou crie uma afinação validada para ativar acordes e o afinador guiado."}
      heroVariant="music"
      heroTag={featured?.isActive ? "Ativa" : featured ? "Disponível" : "Catálogo vazio"}
      activeTuningValue={active?.name ?? "Não definida"}
      activeTuningDetail={active ? "Preferência salva localmente" : "Escolha necessária para recursos musicais"}
      primaryActionLabel={featured ? "Ver detalhes" : "Abrir afinador cromático"}
      onPrimaryActionPress={() =>
        featured
          ? navigation.push({
              pathname: "/tunings/[tuningId]",
              params: { tuningId: featured.ref.id, origin: featured.ref.origin },
            })
          : navigation.push(APP_ROUTES.tunerChromatic)
      }
      secondaryActionLabel="Abrir afinador"
      onSecondaryActionPress={() => navigation.push(APP_ROUTES.tuner)}
    >
      <SearchField
        value={tuningsState.query}
        onChangeText={tuningsState.setQuery}
        placeholder="Buscar afinações"
      />

      <SectionHeader
        title="Afinações locais"
        description={tuningsState.tunings.length === 1 ? "1 afinação no banco local." : `${tuningsState.tunings.length} afinações no banco local.`}
      />

      {tuningsState.status === "loading" ? (
        <LoadingState variant="list" rows={3} title="Carregando afinações" />
      ) : tuningsState.status === "error" ? (
        <ErrorState
          title="Não foi possível carregar as afinações"
          description="A preferência atual não foi alterada."
          details={tuningsState.error?.message}
          onActionPress={() => void tuningsState.refresh()}
        />
      ) : tuningsState.tunings.length === 0 ? (
        <EmptyState
          title={tuningsState.query ? "Nenhuma afinação encontrada" : "Catálogo de afinações vazio"}
          description={tuningsState.query ? "Revise o nome pesquisado." : "O app aguarda conteúdo musical validado e não usa afinações fictícias como dado definitivo."}
          actionLabel="Abrir afinador cromático"
          onActionPress={() => navigation.push(APP_ROUTES.tunerChromatic)}
        />
      ) : (
        <View style={styles.list}>
          {tuningsState.tunings.map((tuning) => (
            <AppCard
              key={`${tuning.ref.origin}-${tuning.ref.id}`}
              variant={tuning.isActive ? "selected" : "interactive"}
              padding="lg"
              title={tuning.name}
              subtitle={tuning.openChordLabel ? `Acorde aberto ${tuning.openChordLabel}` : tuning.shortName}
              description={tuning.courseLabels.length > 0 ? tuning.courseLabels.join(" • ") : "Detalhes disponíveis na ficha da afinação"}
              selected={tuning.isActive}
              onPress={() =>
                navigation.push({
                  pathname: "/tunings/[tuningId]",
                  params: { tuningId: tuning.ref.id, origin: tuning.ref.origin },
                })
              }
              footer={
                <View style={styles.cardFooter}>
                  <Chip label={humanizeSlug(tuning.verificationStatus, tuning.verificationStatus)} variant="status" />
                  <Chip label={tuning.ref.origin === "user" ? "Pessoal" : "Catálogo"} variant="tag" />
                  {tuning.isActive ? <Chip label="Ativa" selected variant="selection" /> : null}
                </View>
              }
            />
          ))}
        </View>
      )}

      <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.tuner)} variant="secondary">
        Revisar tensão antes de trocar
      </AppButton>
    </RoutePlaceholder>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  cardFooter: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
