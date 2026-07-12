import { APP_ROUTES } from "@/constants/routes";
import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";
import { AppButton, AppCard, Chip } from "@/components/ui";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { StyleSheet, View } from "react-native";

export default function BackupScreen() {
  const navigation = useSafeNavigation();

  return (
    <RoutePlaceholder
      eyebrow="Backup"
      title="Salvar e restaurar"
      subtitle="Exportação manual com prévia"
      heroTitle="Arquivo local"
      heroDescription="Esta área prepara o fluxo de exportar, importar e restaurar sem incluir o catálogo base do app."
      heroVariant="premium"
      activeTuningValue="Cebolão em Ré"
      activeTuningDetail="Dados pessoais apenas"
      primaryActionLabel="Exportar backup"
      onPrimaryActionPress={() => navigation.goHome()}
      secondaryActionLabel="Importar arquivo"
      onSecondaryActionPress={() => navigation.push(APP_ROUTES.libraryMySongs)}
    >
      <AppCard
        variant="informative"
        title="Conteúdo do backup"
        description="Configurações, favoritos, cifras próprias e histórico controlado."
        footer={
          <View style={styles.chipRow}>
            <Chip label="Versão 1" variant="status" />
            <Chip label="Sem catálogo" variant="tag" />
          </View>
        }
      />

      <AppCard
        variant="alert"
        title="Confirmação obrigatória"
        description="A restauração não pode sobrescrever silenciosamente os dados do usuário."
        footer={
          <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.settings)} variant="secondary">
            Voltar às configurações
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
