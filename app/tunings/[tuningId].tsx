import { APP_ROUTES } from "@/constants/routes";
import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";
import { AppButton, AppCard, Chip } from "@/components/ui";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { humanizeSlug } from "@/utils/formatters";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function TuningDetailScreen() {
  const navigation = useSafeNavigation();
  const params = useLocalSearchParams<{ tuningId?: string }>();
  const tuningName = humanizeSlug(params.tuningId, "Afinação");

  return (
    <RoutePlaceholder
      eyebrow="Detalhe da afinação"
      title={tuningName}
      subtitle="Notas, ordem das cordas e aviso de tensão"
      heroTitle={`${tuningName} em foco`}
      heroDescription="Aqui entra a visão detalhada da afinação com a numeração das cinco ordens e a descrição dos pares."
      heroVariant="music"
      activeTuningValue={tuningName}
      activeTuningDetail="Conteúdo base para a próxima etapa"
      primaryActionLabel="Ativar esta afinação"
      onPrimaryActionPress={() => navigation.goHome()}
      secondaryActionLabel="Abrir afinador guiado"
      onSecondaryActionPress={() => navigation.push(APP_ROUTES.tunerGuided)}
    >
      <AppCard
        variant="informative"
        title="Notas abertas"
        subtitle="Visual simplificado"
        description="D A F# A D • representação resumida para o shell inicial."
      >
        <View style={styles.chipRow}>
          {["1ª", "2ª", "3ª", "4ª", "5ª"].map((order) => (
            <Chip key={order} label={order} variant="tag" selected={order === "1ª"} />
          ))}
        </View>
      </AppCard>

      <AppCard
        variant="alert"
        title="Tensão e encordoamento"
        description="Se a afinação exigir subida relevante de tensão, o app precisa avisar antes da confirmação."
        footer={
          <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.tuner)} variant="secondary">
            Ler alerta de segurança
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
