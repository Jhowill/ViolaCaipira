import { APP_ROUTES } from "@/constants/routes";
import { AppButton, AppCard, AppHeader, ScreenContainer, TextField } from "@/components/ui";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function ImportSongScreen() {
  const navigation = useSafeNavigation();
  const [text, setText] = useState("[D] Trecho da letra");

  return (
    <ScreenContainer scroll background="default">
      <AppHeader
        title="Importar cifra"
        subtitle="Prévia antes de salvar"
        onBackPress={() => navigation.safeBack(APP_ROUTES.songs)}
      />

      <AppCard
        variant="informative"
        title="Texto bruto"
        subtitle="Prévia antes de salvar"
        description="O shell já separa espaço para reconhecimento de acordes no texto e confirmação antes da escrita."
      />

      <View style={styles.form}>
        <TextField
          label="Texto da cifra"
          value={text}
          onChangeText={setText}
          placeholder="Cole o conteúdo aqui"
          multiline
          numberOfLines={8}
        />
      </View>

      <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.libraryMySongs)} variant="primary">
        Analisar prévia
      </AppButton>
      <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.songs)} variant="secondary">
        Voltar às cifras
      </AppButton>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
});
