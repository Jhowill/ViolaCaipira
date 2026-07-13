import { RhythmCard } from "@/components/rhythms/RhythmCard";
import { RhythmPattern } from "@/components/rhythms/RhythmPattern";
import { AppButton, AppHeader, EmptyState, ErrorState, LoadingState, ScreenContainer, SectionHeader } from "@/components/ui";
import { APP_ROUTES } from "@/constants/routes";
import { useRhythm } from "@/hooks/useRhythm";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import type { ContentOrigin, EntityRef } from "@/types/music";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

function resolveOrigin(value: string | undefined): ContentOrigin {
  return value === "user" ? "user" : "catalog";
}

export default function RhythmDetailScreen() {
  const navigation = useSafeNavigation();
  const params = useLocalSearchParams<{ rhythmId?: string; origin?: string }>();
  const rhythmId = params.rhythmId ?? "missing";
  const ref = useMemo<EntityRef<"rhythm">>(
    () => ({ type: "rhythm", origin: resolveOrigin(params.origin), id: rhythmId }),
    [params.origin, rhythmId],
  );
  const rhythmState = useRhythm({ ref });

  if (rhythmState.status === "loading") {
    return <ScreenContainer variant="centered"><LoadingState title="Carregando ritmo" /></ScreenContainer>;
  }

  if (rhythmState.status === "error") {
    return (
      <ScreenContainer variant="centered">
        <ErrorState
          title="Não foi possível abrir o ritmo"
          description="O catálogo local continua intacto."
          details={rhythmState.error?.message}
          onActionPress={() => void rhythmState.refresh()}
          secondaryActionLabel="Voltar aos ritmos"
          onSecondaryActionPress={() => navigation.safeBack(APP_ROUTES.rhythms)}
        />
      </ScreenContainer>
    );
  }

  if (!rhythmState.rhythm) {
    return (
      <ScreenContainer variant="centered">
        <EmptyState
          title="Ritmo não encontrado"
          description="Ele pode não estar instalado no catálogo local."
          actionLabel="Voltar aos ritmos"
          onActionPress={() => navigation.safeBack(APP_ROUTES.rhythms)}
        />
      </ScreenContainer>
    );
  }

  const rhythm = rhythmState.rhythm;
  return (
    <ScreenContainer scroll>
      <AppHeader
        title={rhythm.name}
        subtitle={`${rhythm.timeSignatureLabel} • ${rhythm.bpm} BPM`}
        onBackPress={() => navigation.safeBack(APP_ROUTES.rhythms)}
      />

      <RhythmCard rhythm={rhythm} showPreview={false} />

      <View style={styles.actions}>
        <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.rhythmPractice(rhythm.ref.id))}>
          Treinar batida
        </AppButton>
        <AppButton fullWidth variant="secondary" onPress={() => navigation.push(APP_ROUTES.metronome)}>
          Abrir metrônomo em {rhythm.bpm} BPM
        </AppButton>
      </View>

      <SectionHeader title="Padrões" description={`${rhythm.patterns.length} padrão${rhythm.patterns.length === 1 ? "" : "ões"} registrado${rhythm.patterns.length === 1 ? "" : "s"}.`} />
      {rhythm.patterns.length === 0 ? (
        <EmptyState title="Sem padrão visual" description="O ritmo existe, mas ainda não possui uma sequência validada." />
      ) : (
        <View style={styles.patterns}>
          {rhythm.patterns.map((pattern) => <RhythmPattern key={pattern.ref.id} pattern={pattern} />)}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ actions: { gap: 10 }, patterns: { gap: 12 } });
