import { APP_ROUTES } from "@/constants/routes";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { AppButton, AppCard, Chip, ScreenContainer, SectionHeader } from "@/components/ui";
import { StyleSheet, Text, View } from "react-native";

const studyTools = [
  {
    label: "Ritmos",
    description: "Cururu, cateretê, toada e mais",
    route: APP_ROUTES.rhythms,
    icon: "≈",
  },
  {
    label: "Metrônomo",
    description: "BPM ajustável e toque rápido",
    route: APP_ROUTES.metronome,
    icon: "◔",
  },
  {
    label: "Minhas cifras",
    description: "Biblioteca pessoal offline",
    route: APP_ROUTES.libraryMySongs,
    icon: "♫",
  },
  {
    label: "Favoritos",
    description: "Atalhos para estudo recorrente",
    route: APP_ROUTES.libraryFavorites,
    icon: "★",
  },
] as const;

export default function StudiesTabScreen() {
  const navigation = useSafeNavigation();
  const { theme } = useAppTheme();

  return (
    <ScreenContainer scroll background="default">
      <AppCard
        variant="premium"
        padding="lg"
        title="Estudos"
        subtitle="Organize o treino, o ritmo e o repertório"
        description="Uma tela para cruzar batida, cifra e hábito de estudo sem abrir várias ferramentas."
        icon={<Text style={[theme.typography.titleSmall, { color: theme.colors.premium }]}>✦</Text>}
        footer={
          <View style={styles.cardFooter}>
            <AppButton onPress={() => navigation.push(APP_ROUTES.metronome)} variant="primary">
              Abrir metrônomo
            </AppButton>
            <AppButton onPress={() => navigation.push(APP_ROUTES.rhythms)} variant="secondary">
              Ver ritmos
            </AppButton>
          </View>
        }
      />

      <SectionHeader
        title="Ferramentas"
        description="Cada cartão leva para uma rota pronta para o estudo do dia."
      />

      <View style={styles.grid}>
        {studyTools.map((tool) => (
          <View key={tool.label} style={styles.gridItem}>
            <AppCard
              fullWidth={false}
              variant="interactive"
              padding="md"
              title={tool.label}
              subtitle={tool.description}
              icon={<Text style={[theme.typography.titleSmall, { color: theme.colors.primary }]}>{tool.icon}</Text>}
              onPress={() => navigation.push(tool.route)}
            />
          </View>
        ))}
      </View>

      <SectionHeader title="Sugestão de exercício" />

      <AppCard
        variant="rhythm"
        padding="lg"
        title="Cururu lento"
        subtitle="3 minutos para aquecer a mão direita"
        description="Conte 1-2-3, toque baixo/alto e volte ao metrônomo em 72 BPM."
        footer={
          <View style={styles.cardFooter}>
            <Chip label="BPM 72" variant="status" />
            <Chip label="Compasso 2/4" variant="note" />
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  cardFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItem: {
    width: "48%",
  },
});
