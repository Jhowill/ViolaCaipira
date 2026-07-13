import { APP_ROUTES } from "@/constants/routes";
import { pitchSpellingToPitchClass } from "@/domain/music/normalization";
import { resolveSongRepository } from "@/hooks/useSongs";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useTunings } from "@/hooks/useTunings";
import { AppButton, AppCard, AppHeader, EmptyState, ErrorState, ScreenContainer, SelectField, TextField } from "@/components/ui";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

const emptyDocument = { version: 1 as const, sections: [] as const };

export default function CreateSongScreen() {
  const navigation = useSafeNavigation();
  const tuningsState = useTunings();
  const activeTuning = tuningsState.tunings.find((tuning) => tuning.isActive) ?? tuningsState.tunings[0];
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [key, setKey] = useState("G");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const save = async () => {
    if (!title.trim() || !activeTuning) return;
    setBusy(true);
    setError(null);
    try {
      const repository = await resolveSongRepository();
      const saved = await repository.saveUserSong({
        title,
        artist: artist.trim() || null,
        copyrightConfirmation: "personal_use_confirmed",
        originalKeyPitchClass: pitchSpellingToPitchClass(key),
        originalKeyMode: "major",
        tuning: activeTuning.ref,
        document: emptyDocument,
      });
      navigation.replace({ pathname: "/songs/[songId]", params: { songId: saved.id, origin: "user" } });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError : new Error("Não foi possível salvar a cifra."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer scroll background="default">
      <AppHeader title="Criar cifra" subtitle="Rascunho simples e local" onBackPress={() => navigation.safeBack(APP_ROUTES.songs)} />
      <AppCard variant="informative" title="Informações básicas" subtitle="Registro pessoal offline" description="O título e os metadados ficam no aparelho. O conteúdo musical pode ser importado na próxima etapa." />
      {tuningsState.status !== "loading" && !activeTuning ? <EmptyState title="Escolha uma afinação primeiro" description="Cifras próprias precisam de uma afinação existente para serem salvas com contexto musical." actionLabel="Revisar afinações" onActionPress={() => navigation.push(APP_ROUTES.tunings)} /> : null}
      <View style={styles.form}>
        <TextField label="Título" value={title} onChangeText={setTitle} placeholder="Nome da música" clearable />
        <TextField label="Artista" value={artist} onChangeText={setArtist} placeholder="Nome do artista" clearable />
        <SelectField label="Tom" value={key} onValueChange={setKey} options={["G", "A", "D", "E"].map((value) => ({ value, label: value }))} title="Selecione o tom" />
      </View>
      {error ? <ErrorState title="Não foi possível salvar" description="O banco local não foi alterado." details={error.message} onActionPress={() => setError(null)} /> : null}
      <AppButton fullWidth loading={busy} disabled={!title.trim() || !activeTuning} onPress={() => void save()} variant="primary">Salvar rascunho</AppButton>
      <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.importSong)} variant="secondary">Importar texto</AppButton>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ form: { gap: 14 } });
