import { MetronomeDial } from "@/components/metronome/MetronomeDial";
import { AppButton, AppCard, AppHeader, Chip, ErrorState, ScreenContainer } from "@/components/ui";
import { APP_ROUTES } from "@/constants/routes";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useMetronome } from "@/hooks/useMetronome";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import type { TimeSignatureDenominator } from "@/types/music";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

const signatures: readonly [number, TimeSignatureDenominator][] = [[2, 4], [3, 4], [4, 4], [6, 8]];

export default function MetronomeScreen() {
  const navigation = useSafeNavigation();
  const { theme } = useAppTheme();
  const metronome = useMetronome();

  useEffect(() => () => { void metronome.handleExit(); }, [metronome.handleExit]);

  return (
    <ScreenContainer scroll maxWidth={720} background="default">
      <AppHeader title="Metrônomo" subtitle="Tempo estável, sem depender de rede" onBackPress={() => navigation.safeBack(APP_ROUTES.studies)} />
      <MetronomeDial state={metronome.state} onPlayPress={() => void metronome.start()} onPausePress={() => void metronome.pause()} onTapPress={() => void metronome.tap()} onIncreasePress={() => void metronome.setBpm(metronome.state.bpm + 1)} onDecreasePress={() => void metronome.setBpm(metronome.state.bpm - 1)} />
      <AppCard variant="informative" title="Configuração rápida" subtitle="Ajuste o pulso do estudo" description="O metrônomo mantém o estado local e para automaticamente ao sair da tela.">
        <View style={styles.chipRow}>{signatures.map(([numerator, denominator]) => <Chip key={`${numerator}/${denominator}`} label={`${numerator}/${denominator}`} selected={metronome.state.timeSignatureNumerator === numerator && metronome.state.timeSignatureDenominator === denominator} variant="selection" onPress={() => void metronome.setTimeSignature(numerator, denominator)} />)}</View>
        <View style={styles.buttonRow}><AppButton variant="secondary" onPress={() => void metronome.setAccentFirstBeat(!metronome.state.accentFirstBeat)}>{metronome.state.accentFirstBeat ? "Desativar acento" : "Ativar acento"}</AppButton><AppButton variant="secondary" onPress={() => void metronome.setCountInBars(metronome.state.countInBars >= 2 ? 0 : 2)}>{metronome.state.countInBars > 0 ? "Sem contagem" : "Contagem 2 compassos"}</AppButton></View>
      </AppCard>
      {metronome.state.error ? <ErrorState title="Metrônomo indisponível" description="O áudio foi interrompido com segurança." details={metronome.state.error.message} onActionPress={() => void metronome.stop()} /> : null}
      <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>O áudio é processado localmente; nenhuma gravação é feita.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, buttonRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 } });
