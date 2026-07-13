import { DetectedNote } from "@/components/tuner/DetectedNote";
import { TunerGauge } from "@/components/tuner/TunerGauge";
import { AppButton, AppCard, AppHeader, ErrorState, ScreenContainer } from "@/components/ui";
import { APP_ROUTES } from "@/constants/routes";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useTuner } from "@/hooks/useTuner";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

export default function ChromaticTunerScreen() {
  const navigation = useSafeNavigation();
  const tuner = useTuner();
  const analysis = tuner.state.analysis;

  useEffect(() => {
    void tuner.setMode("chromatic");
  }, [tuner.setMode]);

  useEffect(() => () => { void tuner.stop(); }, [tuner.stop]);

  return (
    <ScreenContainer scroll maxWidth={720}>
      <AppHeader eyebrow="Afinador cromático" title="Qualquer nota" subtitle="Leitura livre e precisa" onBackPress={() => navigation.safeBack(APP_ROUTES.tuner)} />
      <AppCard variant="informative" title="Leitura do sinal" subtitle={tuner.state.status === "listening" ? "Microfone ativo" : "Microfone parado"} description="O áudio é processado localmente e não é enviado para a rede." />
      <TunerGauge cents={analysis?.centsFromNearestNote ?? 0} statusLabel={analysis ? (Math.abs(analysis.centsFromNearestNote) <= tuner.state.toleranceCents ? "Afinada" : "Ajuste") : "Aguardando"} detailLabel={analysis ? `${analysis.frequency.toFixed(1)} Hz` : "Sem leitura"} signalQuality={analysis?.signalQuality ?? tuner.state.signal.quality} />
      <DetectedNote noteLabel={analysis?.noteLabel ?? "—"} frequencyLabel={analysis ? `${analysis.frequency.toFixed(1)} Hz` : undefined} instructionLabel={analysis ? (analysis.isWithinTolerance ? "A leitura está dentro da tolerância." : "Ajuste lentamente até aproximar do centro.") : "Toque uma corda para começar."} signalQuality={analysis?.signalQuality ?? tuner.state.signal.quality} />
      {tuner.state.error ? <ErrorState title="Não foi possível iniciar o microfone" description="A captura permanece parada até você conceder a permissão." details={tuner.state.error.message} onActionPress={() => void tuner.clearError()} /> : null}
      <View style={styles.actions}><AppButton fullWidth onPress={() => void (tuner.state.status === "listening" ? tuner.pause() : tuner.start())}>{tuner.state.status === "listening" ? "Pausar leitura" : "Iniciar leitura"}</AppButton><AppButton fullWidth variant="secondary" onPress={() => navigation.push(APP_ROUTES.tunerGuided)}>Ir para o guiado</AppButton></View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ actions: { gap: 10 } });
