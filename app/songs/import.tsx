import { APP_ROUTES } from "@/constants/routes";
import { parseSongText } from "@/domain/songs";
import { resolveSongRepository } from "@/hooks/useSongs";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useTunings } from "@/hooks/useTunings";
import { AppButton, AppCard, AppHeader, EmptyState, ErrorState, ScreenContainer, TextField } from "@/components/ui";
import type { SongParseResult } from "@/domain/songs/songParser";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function ImportSongScreen() {
  const navigation = useSafeNavigation();
  const tuningsState = useTunings();
  const activeTuning = tuningsState.tunings.find((tuning) => tuning.isActive) ?? tuningsState.tunings[0];
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<SongParseResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const analyze = () => {
    setError(null);
    setPreview(parseSongText(text));
  };

  const save = async () => {
    if (!preview || !activeTuning || !text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const repository = await resolveSongRepository();
      const saved = await repository.saveUserSong({
        title: preview.sections[0]?.label ?? "Cifra importada",
        copyrightConfirmation: "personal_use_confirmed",
        tuning: activeTuning.ref,
        document: preview.document,
      });
      navigation.replace({ pathname: "/songs/[songId]", params: { songId: saved.id, origin: "user" } });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError : new Error("Não foi possível salvar a importação."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer scroll background="default">
      <AppHeader title="Importar cifra" subtitle="Prévia antes de salvar" onBackPress={() => navigation.safeBack(APP_ROUTES.songs)} />
      <AppCard variant="informative" title="Texto bruto" subtitle="Reconhecimento local" description="Cole apenas conteúdo que você tem autorização para usar. O parser identifica seções, acordes e avisos antes da gravação." />
      <View style={styles.form}><TextField label="Texto da cifra" value={text} onChangeText={setText} placeholder="Cole o conteúdo aqui" multiline numberOfLines={8} /></View>
      <AppButton fullWidth disabled={!text.trim()} onPress={analyze} variant="primary">Analisar prévia</AppButton>
      {preview ? <AppCard variant={preview.warnings.length > 0 ? "alert" : "selected"} title="Prévia analisada" description={`${preview.sections.length} seções • ${preview.recognizedChords.length} acordes reconhecidos${preview.warnings.length > 0 ? ` • ${preview.warnings.length} avisos` : ""}`} footer={<AppButton fullWidth loading={busy} disabled={!activeTuning} onPress={() => void save()} variant="primary">Salvar no repertório</AppButton>} /> : null}
      {!activeTuning && tuningsState.status !== "loading" ? <EmptyState title="Afinação necessária" description="Importações precisam de uma afinação local para preservar o contexto da cifra." actionLabel="Revisar afinações" onActionPress={() => navigation.push(APP_ROUTES.tunings)} /> : null}
      {error ? <ErrorState title="Falha na importação" description="Nada foi gravado no banco local." details={error.message} onActionPress={() => setError(null)} /> : null}
      <AppButton fullWidth onPress={() => navigation.safeBack(APP_ROUTES.songs)} variant="secondary">Voltar às cifras</AppButton>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ form: { gap: 14 } });
