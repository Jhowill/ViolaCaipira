import { APP_ROUTES } from "@/constants/routes";
import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";
import { AppButton, AppCard, Chip } from "@/components/ui";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { StyleSheet, View } from "react-native";

const references = ["1ª corda", "2ª corda", "3ª corda", "4ª corda", "5ª corda"] as const;

export default function ReferenceSoundsScreen() {
  const navigation = useSafeNavigation();

  return (
    <RoutePlaceholder
      eyebrow="Sons de referência"
      title="Escute as cordas"
      subtitle="Uma faixa por nota e por par"
      heroTitle="Biblioteca de notas"
      heroDescription="Cada botão abaixo representa um áudio local que poderá ser ligado às cordas e pares da afinação."
      heroVariant="music"
      activeTuningValue="Cebolão em Ré"
      activeTuningDetail="Catálogo compatível com a afinação ativa"
      primaryActionLabel="Voltar ao afinador"
      onPrimaryActionPress={() => navigation.push(APP_ROUTES.tuner)}
      secondaryActionLabel="Abrir guiado"
      onSecondaryActionPress={() => navigation.push(APP_ROUTES.tunerGuided)}
    >
      <AppCard
        variant="informative"
        title="Sequência disponível"
        description="O shell reserva o espaço para tocar cordas em sequência sem usar rede."
      >
        <View style={styles.chipRow}>
          {references.map((reference, index) => (
            <Chip key={reference} label={`${index + 1}. ${reference}`} variant="note" />
          ))}
        </View>
      </AppCard>

      <AppCard
        variant="selected"
        title="Dica de uso"
        description="Toque uma referência por vez para não confundir o ouvido durante o estudo."
        footer={
          <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.tunerChromatic)} variant="secondary">
            Abrir cromático
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
