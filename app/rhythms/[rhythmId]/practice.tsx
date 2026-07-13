import { RhythmPattern } from "@/components/rhythms/RhythmPattern";
import { AppButton, AppHeader, EmptyState, ErrorState, LoadingState, ScreenContainer } from "@/components/ui";
import { APP_ROUTES } from "@/constants/routes";
import { useMetronome } from "@/hooks/useMetronome";
import { useRhythm } from "@/hooks/useRhythm";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import type { ContentOrigin, EntityRef } from "@/types/music";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo } from "react";

function resolveOrigin(value: string | undefined): ContentOrigin {
  return value === "user" ? "user" : "catalog";
}

export default function RhythmPracticeScreen() {
  const navigation = useSafeNavigation();
  const params = useLocalSearchParams<{ rhythmId?: string; origin?: string }>();
  const rhythmId = params.rhythmId ?? "missing";
  const ref = useMemo<EntityRef<"rhythm">>(() => ({ type: "rhythm", origin: resolveOrigin(params.origin), id: rhythmId }), [params.origin, rhythmId]);
  const rhythmState = useRhythm({ ref });
  const metronome = useMetronome();
  const rhythm = rhythmState.rhythm;
  const pattern = rhythm?.patterns[0] ?? null;

  useEffect(() => {
    if (!rhythm) return;
    void metronome.setBpm(rhythm.bpm);
    void metronome.setTimeSignature(rhythm.timeSignatureNumerator, rhythm.timeSignatureDenominator);
  }, [metronome.setBpm, metronome.setTimeSignature, rhythm]);

  useEffect(() => () => { void metronome.handleExit(); }, [metronome.handleExit]);

  if (rhythmState.status === "loading") return <ScreenContainer variant="centered"><LoadingState title="Carregando prática" /></ScreenContainer>;
  if (rhythmState.status === "error") return <ScreenContainer variant="centered"><ErrorState title="Não foi possível abrir a prática" description="O ritmo local permanece intacto." details={rhythmState.error?.message} onActionPress={() => void rhythmState.refresh()} secondaryActionLabel="Voltar aos ritmos" onSecondaryActionPress={() => navigation.safeBack(APP_ROUTES.rhythms)} /></ScreenContainer>;
  if (!rhythm) return <ScreenContainer variant="centered"><EmptyState title="Ritmo não encontrado" description="A prática depende de um ritmo instalado no banco local." actionLabel="Voltar aos ritmos" onActionPress={() => navigation.safeBack(APP_ROUTES.rhythms)} /></ScreenContainer>;
  if (!pattern) return <ScreenContainer variant="centered"><EmptyState title="Prática sem padrão" description="O ritmo ainda não possui uma sequência validada para estudo." actionLabel="Voltar ao ritmo" onActionPress={() => navigation.safeBack(APP_ROUTES.rhythmDetail(rhythm.ref.id))} /></ScreenContainer>;

  const currentStepIndex = metronome.state.beat.beatInBar === null ? null : (metronome.state.beat.beatInBar - 1) % pattern.steps.length;
  return (
    <ScreenContainer scroll maxWidth={720}>
      <AppHeader eyebrow="Prática de ritmo" title={rhythm.name} subtitle="Sequência guiada com metrônomo" onBackPress={() => navigation.safeBack(APP_ROUTES.rhythmDetail(rhythm.ref.id))} />
      <RhythmPattern pattern={pattern} currentStepIndex={currentStepIndex} description={rhythm.description ?? undefined} />
      <AppButton fullWidth onPress={() => void (metronome.state.status === "playing" || metronome.state.status === "counting_in" ? metronome.pause() : metronome.start())}>{metronome.state.status === "playing" || metronome.state.status === "counting_in" ? "Pausar prática" : `Iniciar em ${metronome.state.bpm} BPM`}</AppButton>
      <AppButton fullWidth variant="secondary" onPress={() => navigation.push(APP_ROUTES.metronome)}>Abrir controles do metrônomo</AppButton>
    </ScreenContainer>
  );
}
