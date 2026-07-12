import { APP_ROUTES } from "@/constants/routes";
import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";
import { AppButton, AppCard, Chip } from "@/components/ui";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { StyleSheet, View } from "react-native";

export default function GuidedTunerScreen() {
  const navigation = useSafeNavigation();

  return (
    <RoutePlaceholder
      eyebrow="Afinador guiado"
      title="Passo a passo por corda"
      subtitle="Concentre-se em um par por vez"
      heroTitle="Primeira corda"
      heroDescription="O shell já prepara a trilha visual para mostrar nota esperada, cents e instruções de afrouxar/apertar."
      heroVariant="music"
      activeTuningValue="Cebolão em Ré"
      activeTuningDetail="Escolha feita antes da leitura"
      primaryActionLabel="Ir para cromático"
      onPrimaryActionPress={() => navigation.push(APP_ROUTES.tunerChromatic)}
      secondaryActionLabel="Ouvir referências"
      onSecondaryActionPress={() => navigation.push(APP_ROUTES.tunerReference)}
    >
      <AppCard
        variant="selected"
        title="Par atual"
        subtitle="Corda 1 de 5"
        description="Mostre aqui a nota alvo e a diferença em cents."
      >
        <View style={styles.chipRow}>
          <Chip label="Aperte" variant="status" selected />
          <Chip label="-12 cents" variant="note" />
        </View>
      </AppCard>

      <AppCard
        variant="alert"
        title="Permissão de microfone"
        description="A leitura real só começa quando o usuário optar por abrir o modo com microfone."
        footer={
          <AppButton fullWidth onPress={() => navigation.safeBack(APP_ROUTES.tuner)} variant="secondary">
            Voltar ao afinador
          </AppButton>
        }
      />
    </RoutePlaceholder>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
});
