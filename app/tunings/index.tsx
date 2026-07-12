import { APP_ROUTES } from "@/constants/routes";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { humanizeSlug } from "@/utils/formatters";
import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";
import { AppButton, AppCard, SectionHeader } from "@/components/ui";
import { StyleSheet, View } from "react-native";

const tunings = [
  { id: "cebolao-em-re", title: "Cebolão em Ré", subtitle: "Acorde base equilibrado", tone: "D", status: "verified" },
  { id: "cebolao-em-mi", title: "Cebolão em Mi", subtitle: "Mais brilhante e aberta", tone: "E", status: "calculated" },
  { id: "rio-abaixo", title: "Rio Abaixo", subtitle: "Clássica para repertório raiz", tone: "A", status: "verified" },
  { id: "boiadeira", title: "Boiadeira", subtitle: "Leitura confortável e firme", tone: "G", status: "user_created" },
] as const;

export default function TuningsScreen() {
  const navigation = useSafeNavigation();

  return (
    <RoutePlaceholder
      eyebrow="Afinações"
      title="Escolha a base da viola"
      subtitle="A afinação muda os acordes, o afinador e o repertório sugerido."
      heroTitle="Cebolão em Ré"
      heroDescription="A afinação ativa aparece em todo o app para reduzir erro de contexto e tornar a navegação segura."
      heroVariant="music"
      heroTag="Mais usada"
      activeTuningValue="Cebolão em Ré"
      activeTuningDetail="Revisada e pronta para estudo"
      primaryActionLabel="Abrir afinador"
      onPrimaryActionPress={() => navigation.push(APP_ROUTES.tunerGuided)}
      secondaryActionLabel="Ver dicas de segurança"
      onSecondaryActionPress={() => navigation.push(APP_ROUTES.tuner)}
    >
      <SectionHeader
        title="Afinações iniciais"
        description="Esta lista já respeita o que as referências do app pedem para a V1."
      />

      <View style={styles.list}>
        {tunings.map((tuning) => (
          <AppCard
            key={tuning.id}
            variant="interactive"
            padding="lg"
            title={tuning.title}
            subtitle={tuning.subtitle}
            description={`Tônica base ${tuning.tone} • status ${humanizeSlug(tuning.status, tuning.status)}`}
            onPress={() => navigation.push(APP_ROUTES.tuningDetail(tuning.id))}
          />
        ))}
      </View>

      <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.tuner)} variant="secondary">
        Revisar tensão antes de trocar
      </AppButton>
    </RoutePlaceholder>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
});
