import { APP_ROUTES } from "@/constants/routes";
import { useBackup } from "@/hooks/useBackup";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { AppButton, AppCard, AppHeader, Chip, ErrorState, ScreenContainer, TextField } from "@/components/ui";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function BackupScreen() {
  const navigation = useSafeNavigation();
  const backup = useBackup();
  const [serialized, setSerialized] = useState("");
  const [mode, setMode] = useState<"replace" | "merge">("replace");

  return (
    <ScreenContainer scroll background="default">
      <AppHeader eyebrow="Backup" title="Salvar e restaurar" subtitle="Exportação manual com validação" onBackPress={() => navigation.safeBack(APP_ROUTES.settings)} />
      <AppCard variant="premium" title="Arquivo local" subtitle="Dados pessoais apenas" description="O backup inclui preferências, cifras próprias, favoritos e histórico. O catálogo oficial nunca é copiado." footer={<View style={styles.row}><AppButton loading={backup.busy} onPress={() => void backup.exportBackup()} variant="primary">Exportar backup</AppButton><Chip label="Versão 1" variant="status" /></View>} />
      {backup.artifact ? <AppCard variant="selected" title="Backup preparado" description={`${backup.artifact.byteLength} bytes • ${backup.artifact.manifest.sections.length} seções`} footer={<AppButton fullWidth variant="secondary" onPress={() => setSerialized(JSON.stringify({ manifest: backup.artifact?.manifest, payload: backup.artifact?.payload }))}>Preencher importação com esta prévia</AppButton>} /> : null}
      <AppCard variant="informative" title="Importar arquivo" subtitle="Cole o JSON exportado pelo app" description="O checksum e o schema são verificados antes de qualquer escrita.">
        <View style={styles.form}><TextField label="JSON do backup" value={serialized} onChangeText={setSerialized} placeholder="Cole o conteúdo aqui" multiline numberOfLines={6} /></View>
        <View style={styles.row}>{(["replace", "merge"] as const).map((value) => <Chip key={value} label={value === "replace" ? "Substituir" : "Mesclar"} selected={mode === value} variant="selection" onPress={() => setMode(value)} />)}</View>
        <AppButton fullWidth loading={backup.busy} disabled={!serialized.trim()} onPress={() => void backup.importBackup(serialized, mode)} variant="primary">Validar e restaurar</AppButton>
      </AppCard>
      {backup.result ? <AppCard variant="selected" title="Backup restaurado" description={`${backup.result.restoredRows} registros restaurados no modo ${backup.result.mode}.`} /> : null}
      {backup.error ? <ErrorState title="Backup não concluído" description="Nenhuma alteração parcial é mantida quando a validação falha." details={backup.error.message} onActionPress={backup.clearError} /> : null}
      <AppButton fullWidth onPress={() => navigation.safeBack(APP_ROUTES.settings)} variant="secondary">Voltar às configurações</AppButton>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ form: { gap: 12 }, row: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 } });
