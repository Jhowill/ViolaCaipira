import { ActiveTuningPill } from "@/components/navigation/ActiveTuningPill";
import { APP_ROUTES } from "@/constants/routes";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { AppButton, AppCard, AppHeader, Chip, OfflineBadge, ScreenContainer, SectionHeader } from "@/components/ui";
import { StyleSheet, Text, View } from "react-native";

const shortcutCards = [
  {
    label: "Cifras",
    subtitle: "Retome sua última música",
    icon: "♪",
    onPress: APP_ROUTES.songs,
  },
  {
    label: "Acordes",
    subtitle: "Formas e diagramas",
    icon: "◫",
    onPress: APP_ROUTES.chords,
  },
  {
    label: "Afinador",
    subtitle: "Guiado por afinação",
    icon: "◉",
    onPress: APP_ROUTES.tuner,
  },
  {
    label: "Estudos",
    subtitle: "Ritmo, metronomo e treino",
    icon: "✦",
    onPress: APP_ROUTES.studies,
  },
  {
    label: "Ritmos",
    subtitle: "Cururu, cateretê e mais",
    icon: "≈",
    onPress: APP_ROUTES.rhythms,
  },
  {
    label: "Configurações",
    subtitle: "Aparência e backup",
    icon: "⚙",
    onPress: APP_ROUTES.settings,
  },
] as const;

export default function HomeScreen() {
  const navigation = useSafeNavigation();
  const { theme } = useAppTheme();

  return (
    <ScreenContainer scroll background="default">
      <AppHeader
        eyebrow="BOM ESTUDO"
        title="Sua viola hoje"
        subtitle="Tudo offline, com as rotas principais já prontas."
        primaryAction={{
          accessibilityLabel: "Abrir configurações",
          icon: <Text style={{ color: theme.colors.primary }}>⚙</Text>,
          onPress: () => navigation.replace(APP_ROUTES.settings),
        }}
        secondaryAction={{
          accessibilityLabel: "Abrir favoritos",
          icon: <Text style={{ color: theme.colors.primary }}>★</Text>,
          onPress: () => navigation.replace(APP_ROUTES.libraryFavorites),
        }}
      />

      <View style={styles.stack}>
        <ActiveTuningPill
          value="Cebolão em Ré"
          detail="5 ordens • 10 cordas"
          onPress={() => navigation.replace(APP_ROUTES.tunings)}
        />

        <AppCard
          variant="music"
          padding="lg"
          title="Pronto para afinar?"
          subtitle="A afinação ativa fica sempre visível."
          description="Comece pelo modo guiado e siga para as demais telas sem perder contexto."
          footer={
            <View style={styles.buttonRow}>
              <AppButton onPress={() => navigation.push(APP_ROUTES.tunerGuided)} variant="primary">
                Afinar agora
              </AppButton>
              <AppButton onPress={() => navigation.push(APP_ROUTES.tunings)} variant="secondary">
                Escolher afinação
              </AppButton>
            </View>
          }
        />

        <OfflineBadge description="Conteúdo local pronto para uso sem rede." />

        <SectionHeader
          title="Continuar"
          description="Retome a última cifra e siga do ponto onde parou."
        />

        <AppCard
          variant="interactive"
          title="Romaria da Serra"
          subtitle="Última cifra aberta"
          description="Tom G • Cururu • retomada no refrão"
          icon={<Text style={[theme.typography.titleSmall, { color: theme.colors.primary }]}>♪</Text>}
          onPress={() => navigation.push(APP_ROUTES.songDetail("romaria-da-serra"))}
        >
          <View style={styles.cardFooter}>
            <Chip label="Disponível offline" variant="status" />
            <Chip label="Cebolão em Ré" variant="selection" selected />
          </View>
        </AppCard>

        <SectionHeader
          title="Atalhos"
          description="Acessos rápidos para o estudo diário."
        />

        <View style={styles.grid}>
          {shortcutCards.map((card) => (
            <View key={card.label} style={styles.gridItem}>
              <AppCard
                fullWidth={false}
                padding="md"
                title={card.label}
                subtitle={card.subtitle}
                variant="interactive"
                icon={<Text style={[theme.typography.titleSmall, { color: theme.colors.primary }]}>{card.icon}</Text>}
                onPress={() => navigation.push(card.onPress)}
              />
            </View>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
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
