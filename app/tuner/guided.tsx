import { DetectedNote } from "@/components/tuner/DetectedNote";
import { TunerGauge } from "@/components/tuner/TunerGauge";
import { AppButton, AppCard, AppHeader, Chip, EmptyState, ErrorState, ScreenContainer } from "@/components/ui";
import { APP_ROUTES } from "@/constants/routes";
import { createTunerTarget } from "@/domain/tuner";
import { pitchClassToSpelling } from "@/domain/music/conversions";
import { useActiveTuning } from "@/hooks/useActiveTuning";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useTuner } from "@/hooks/useTuner";
import type { TunerGuidanceInstruction } from "@/types/tuner";
import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";

const instructionLabels: Record<TunerGuidanceInstruction, string> = {
  wait: "Aguardando uma leitura estável.",
  check_note: "Confira a nota alvo antes de ajustar.",
  tighten: "Aperte a corda aos poucos.",
  loosen: "Afrouxe a corda aos poucos.",
  in_tune: "Afinação dentro da tolerância.",
};

export default function GuidedTunerScreen() {
  const navigation = useSafeNavigation();
  const tuner = useTuner();
  const activeTuning = useActiveTuning();
  const targets = useMemo(
    () => activeTuning.tuning?.courses.flatMap((course) => course.strings.map((string) => createTunerTarget({
      label: `${course.courseNumber}ª ordem · ${pitchClassToSpelling(string.pitchClass, "contextual")}${string.octave}`,
      pitchClass: string.pitchClass,
      octave: string.octave,
      calibrationA4: tuner.state.calibrationA4,
      courseNumber: course.courseNumber,
      stringInCourse: string.stringInCourse,
    }))) ?? [],
    [activeTuning.tuning, tuner.state.calibrationA4],
  );

  useEffect(() => {
    void tuner.setMode("guided");
  }, [tuner.setMode]);

  useEffect(() => {
    void tuner.setGuidedTargets(targets);
  }, [targets, tuner.setGuidedTargets]);

  useEffect(() => () => { void tuner.stop(); }, [tuner.stop]);

  const analysis = tuner.state.analysis;
  const target = tuner.state.target;
  const statusLabel = tuner.state.status === "listening" ? (analysis?.isWithinTolerance ? "Afinada" : "Ajuste") : "Pronto para ouvir";

  const toggleCapture = () => {
    void (tuner.state.status === "listening" ? tuner.pause() : tuner.start());
  };

  return (
    <ScreenContainer scroll maxWidth={720}>
      <AppHeader
        eyebrow="Afinador guiado"
        title="Passo a passo por corda"
        subtitle="Concentre-se em um par por vez"
        onBackPress={() => navigation.safeBack(APP_ROUTES.tuner)}
        activeTuningValue={activeTuning.tuning?.name ?? "Não definida"}
      />

      {activeTuning.status === "error" ? (
        <ErrorState title="Afinação não disponível" description="Escolha uma afinação instalada para iniciar o modo guiado." details={activeTuning.error?.message} onActionPress={() => navigation.push(APP_ROUTES.tunings)} actionLabel="Escolher afinação" />
      ) : targets.length === 0 ? (
        <EmptyState title="Nenhuma corda configurada" description="O modo guiado precisa de uma afinação com ordens e cordas no banco local." actionLabel="Revisar afinações" onActionPress={() => navigation.push(APP_ROUTES.tunings)} />
      ) : (
        <>
          <AppCard variant="selected" title="Par atual" subtitle={target?.label ?? "Concluído"} description={tuner.state.guided ? `${tuner.state.guided.completedCount} de ${tuner.state.guided.totalCount} cordas concluídas.` : "Prepare a primeira leitura."}>
            <View style={styles.chipRow}>
              <Chip label={tuner.state.status === "listening" ? "Microfone ativo" : "Microfone parado"} variant="status" selected={tuner.state.status === "listening"} />
              {analysis ? <Chip label={`${analysis.centsFromTarget ?? analysis.centsFromNearestNote} cents`} variant="note" /> : null}
            </View>
          </AppCard>

          <TunerGauge cents={analysis?.centsFromTarget ?? analysis?.centsFromNearestNote ?? 0} statusLabel={statusLabel} detailLabel={analysis ? `${analysis.frequency.toFixed(1)} Hz` : "Aguardando leitura"} signalQuality={analysis?.signalQuality ?? tuner.state.signal.quality} />

          <DetectedNote noteLabel={analysis?.noteLabel ?? "—"} targetLabel={target?.label} frequencyLabel={analysis ? `${analysis.frequency.toFixed(1)} Hz` : undefined} instructionLabel={analysis?.instruction ? instructionLabels[analysis.instruction] : "Toque uma corda para começar."} signalQuality={analysis?.signalQuality ?? tuner.state.signal.quality} signalQualityDetail={tuner.state.signal.weaknessReason === "none" ? undefined : tuner.state.signal.weaknessReason} />

          {tuner.state.error ? <ErrorState title="Não foi possível iniciar o microfone" description="O app não grava nem envia o áudio. Verifique a permissão e tente novamente." details={tuner.state.error.message} onActionPress={() => void tuner.clearError()} /> : null}

          <View style={styles.actions}>
            <AppButton fullWidth onPress={toggleCapture}>{tuner.state.status === "listening" ? "Pausar leitura" : "Iniciar leitura"}</AppButton>
            <AppButton fullWidth variant="secondary" disabled={!tuner.state.guided?.canAdvance} onPress={() => void tuner.advanceTarget()}>Próxima corda</AppButton>
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }, actions: { gap: 10 } });
