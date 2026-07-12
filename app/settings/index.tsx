import { APP_ROUTES } from "@/constants/routes";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { AppButton, AppCard, AppHeader, Chip, ScreenContainer } from "@/components/ui";
import { StyleSheet, Text, View } from "react-native";

const settingGroups = [
  {
    title: "Aparência",
    description: "Tema, contraste e leitura",
    chips: ["Sistema", "Claro", "Escuro"],
  },
  {
    title: "Música e diagramas",
    description: "Afinação, cinco ordens e dez cordas",
    chips: ["Cebolão em Ré", "5 ordens", "10 cordas"],
  },
  {
    title: "Afinador",
    description: "Calibração e tolerância em cents",
    chips: ["A4 = 440 Hz", "± 5 cents"],
  },
  {
    title: "Armazenamento",
    description: "Histórico, favoritos e backup",
    chips: ["Local", "Offline"],
  },
] as const;

export default function SettingsScreen() {
  const navigation = useSafeNavigation();

  return (
    <ScreenContainer scroll background="default">
      <AppHeader
        title="Configurações"
        subtitle="Ajustes de aparência, áudio e dados locais"
        onBackPress={() => navigation.safeBack(APP_ROUTES.home)}
      />

      <AppCard
        variant="informative"
        padding="lg"
        title="Áreas de ajuste"
        subtitle="Ajustes de aparência, áudio e dados locais"
        description="A tela já organiza as seções principais e deixa o caminho do backup evidente."
        icon={<Text style={{ fontSize: 20 }}>⚙</Text>}
      />

      <View style={styles.list}>
        {settingGroups.map((group) => (
          <AppCard
            key={group.title}
            variant="informative"
            padding="lg"
            title={group.title}
            subtitle={group.description}
            footer={
              <View style={styles.cardFooter}>
                {group.chips.map((chip) => (
                  <Chip key={chip} label={chip} variant="tag" />
                ))}
              </View>
            }
          />
        ))}
      </View>

      <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.settingsBackup)} variant="primary">
        Abrir backup local
      </AppButton>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  cardFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
