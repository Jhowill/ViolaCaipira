import { APP_ROUTES } from "@/constants/routes";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { AppButton, AppCard, Chip, ScreenContainer } from "@/components/ui";
import { ActiveTuningPill } from "@/components/navigation/ActiveTuningPill";
import { StyleSheet, Text, View } from "react-native";

const modes = [
  {
    label: "Guiado",
    description: "Passo a passo por corda e par.",
    route: APP_ROUTES.tunerGuided,
    icon: "◉",
  },
  {
    label: "Cromático",
    description: "Leitura livre da nota captada.",
    route: APP_ROUTES.tunerChromatic,
    icon: "◍",
  },
  {
    label: "Referências",
    description: "Som local para checagem rápida.",
    route: APP_ROUTES.tunerReference,
    icon: "♪",
  },
] as const;

export default function TunerTabScreen() {
  const navigation = useSafeNavigation();
  const { theme } = useAppTheme();

  return (
    <ScreenContainer scroll background="default">
      <AppCard
        variant="informative"
        padding="md"
        title="Afinador"
        subtitle="Modos prontos para microfone ou referência"
        description="A interface já separa o modo guiado, o cromático e os sons de referência."
        icon={<Text style={[theme.typography.titleSmall, { color: theme.colors.primary }]}>◉</Text>}
      />

      <ActiveTuningPill
        value="Cebolão em Ré"
        detail="Escolha a afinação antes de abrir o microfone"
        onPress={() => navigation.replace(APP_ROUTES.tunings)}
      />

      <View style={styles.list}>
        {modes.map((mode) => (
          <AppCard
            key={mode.label}
            variant="interactive"
            padding="lg"
            title={mode.label}
            subtitle={mode.description}
            icon={<Text style={[theme.typography.titleSmall, { color: theme.colors.primary }]}>{mode.icon}</Text>}
            onPress={() => navigation.push(mode.route)}
            footer={
              <View style={styles.cardFooter}>
                <Chip label="Local" variant="status" />
                <Chip label="Sem gravação" variant="tag" />
              </View>
            }
          />
        ))}
      </View>

      <AppCard
        variant="alert"
        padding="lg"
        title="Segurança da corda"
        description="Se a nova afinação exigir mais tensão, o app avisa antes de avançar."
        footer={
          <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.tunings)} variant="secondary">
            Revisar afinações
          </AppButton>
        }
      />
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
