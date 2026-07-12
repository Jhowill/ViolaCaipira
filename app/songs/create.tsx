import { APP_ROUTES } from "@/constants/routes";
import { AppButton, AppCard, AppHeader, ScreenContainer, SelectField, TextField } from "@/components/ui";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function CreateSongScreen() {
  const navigation = useSafeNavigation();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [key, setKey] = useState<string>("G");

  return (
    <ScreenContainer scroll background="default">
      <AppHeader
        title="Criar cifra"
        subtitle="Rascunho simples e local"
        onBackPress={() => navigation.safeBack(APP_ROUTES.songs)}
      />

      <AppCard
        variant="informative"
        title="Informações básicas"
        subtitle="Rascunho simples e local"
        description="A tela já reserva os campos principais para o editor de cifras próprias."
      />

      <View style={styles.form}>
        <TextField label="Título" value={title} onChangeText={setTitle} placeholder="Nome da música" clearable />
        <TextField label="Artista" value={artist} onChangeText={setArtist} placeholder="Nome do artista" clearable />
        <SelectField
          label="Tom"
          value={key}
          onValueChange={setKey}
          options={[
            { value: "G", label: "G" },
            { value: "A", label: "A" },
            { value: "D", label: "D" },
            { value: "E", label: "E" },
          ]}
          title="Selecione o tom"
        />
      </View>

      <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.libraryMySongs)} variant="primary">
        Salvar rascunho
      </AppButton>
      <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.importSong)} variant="secondary">
        Importar texto
      </AppButton>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
});
