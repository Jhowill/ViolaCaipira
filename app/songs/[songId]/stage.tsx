import { APP_ROUTES } from "@/constants/routes";
import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";
import { AppButton, AppCard, Chip } from "@/components/ui";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { humanizeSlug } from "@/utils/formatters";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function SongStageScreen() {
  const navigation = useSafeNavigation();
  const params = useLocalSearchParams<{ songId?: string }>();
  const songTitle = humanizeSlug(params.songId, "Modo palco");

  return (
    <RoutePlaceholder
      eyebrow="Modo palco"
      title={songTitle}
      subtitle="Letras grandes, acordes destacados e navegação rápida"
      heroTitle="Tudo pronto para tocar"
      heroDescription="Este é o espaço para o modo palco com o comportamento crítico isolado do restante do app."
      heroVariant="music"
      activeTuningValue="Cebolão em Ré"
      activeTuningDetail="Tela compacta de apresentação"
      primaryActionLabel="Voltar à cifra"
      onPrimaryActionPress={() => navigation.safeBack(APP_ROUTES.songDetail(params.songId ?? "romaria-da-serra"))}
      secondaryActionLabel="Ver batida"
      onSecondaryActionPress={() => navigation.push(APP_ROUTES.rhythmDetail("cururu"))}
    >
      <AppCard
        variant="selected"
        title="Trecho atual"
        subtitle="Letra ampliada"
        description="Linha 1\nLinha 2\nLinha 3"
      >
        <View style={styles.chipRow}>
          <Chip label="Pausado" variant="status" />
          <Chip label="Auto rolagem" variant="selection" selected />
        </View>
      </AppCard>

      <AppCard
        variant="informative"
        title="Controle de palco"
        description="Os controles finais vão incluir rolagem, alto contraste e saída deliberada."
        footer={
          <AppButton fullWidth onPress={() => navigation.goHome()} variant="secondary">
            Sair do palco
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
