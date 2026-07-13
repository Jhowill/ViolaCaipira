import { ChordCard } from "@/components/chords/ChordCard";
import { ChordDiagram } from "@/components/chords/ChordDiagram";
import { AppButton, AppHeader, EmptyState, ErrorState, LoadingState, ScreenContainer, SectionHeader, SegmentedControl } from "@/components/ui";
import { APP_ROUTES } from "@/constants/routes";
import { useChordShape } from "@/hooks/useChordShape";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import type { ContentOrigin, DiagramMode } from "@/types/music";
import { humanizeSlug } from "@/utils/formatters";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

function resolveOrigin(value: string | undefined): ContentOrigin | "all" {
  if (value === "catalog" || value === "user") {
    return value;
  }
  return "all";
}

export default function ChordDetailScreen() {
  const navigation = useSafeNavigation();
  const onboarding = useOnboarding();
  const params = useLocalSearchParams<{ shapeId?: string; origin?: string }>();
  const [mode, setMode] = useState<DiagramMode>(onboarding.snapshot?.draft.diagramMode ?? "five_courses");
  const shapeState = useChordShape({
    shapeId: params.shapeId ?? "missing",
    origin: resolveOrigin(params.origin),
  });

  if (shapeState.status === "loading") {
    return <ScreenContainer variant="centered"><LoadingState title="Carregando acorde" /></ScreenContainer>;
  }

  if (shapeState.status === "error") {
    return (
      <ScreenContainer variant="centered">
        <ErrorState
          title="Não foi possível abrir o acorde"
          description="A afinação ativa não foi alterada."
          details={shapeState.error?.message}
          onActionPress={() => void shapeState.refresh()}
          secondaryActionLabel="Voltar aos acordes"
          onSecondaryActionPress={() => navigation.safeBack(APP_ROUTES.chords)}
        />
      </ScreenContainer>
    );
  }

  if (!shapeState.shape) {
    return (
      <ScreenContainer variant="centered">
        <EmptyState
          title="Forma de acorde não encontrada"
          description="Ela pode não existir para a afinação escolhida."
          actionLabel="Voltar aos acordes"
          onActionPress={() => navigation.safeBack(APP_ROUTES.chords)}
        />
      </ScreenContainer>
    );
  }

  const shape = shapeState.shape;
  const diagramShape = { ...shape, id: shape.ref.id };

  return (
    <ScreenContainer scroll maxWidth={640}>
      <AppHeader
        title={shape.symbol}
        subtitle={`${shape.name} • ${humanizeSlug(shape.verificationStatus, shape.verificationStatus)}`}
        onBackPress={() => navigation.safeBack(APP_ROUTES.chords)}
        activeTuningValue={humanizeSlug(shape.tuning.id, "Afinação")}
      />

      <SegmentedControl
        accessibilityLabel="Modo do diagrama"
        value={mode}
        onValueChange={setMode}
        options={[
          { value: "five_courses", label: "Cinco ordens" },
          { value: "ten_strings", label: "Dez cordas" },
        ]}
      />

      <ChordDiagram
        shape={diagramShape}
        mode={mode}
        leftHanded={onboarding.snapshot?.draft.handedness === "left"}
        showIntervals
        showNotes
      />

      <View style={styles.actions}>
        <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.songs)}>
          Abrir cifras relacionadas
        </AppButton>
        <AppButton fullWidth variant="secondary" onPress={() => navigation.push(APP_ROUTES.tuner)}>
          Ajustar afinação ativa
        </AppButton>
      </View>

      <SectionHeader title="Outras posições" description={`${shapeState.alternatives.length} alternativa${shapeState.alternatives.length === 1 ? "" : "s"}.`} />
      {shapeState.alternatives.length === 0 ? (
        <EmptyState title="Sem posições alternativas" description="Nenhuma outra forma compatível está registrada." />
      ) : (
        <View style={styles.alternatives}>
          {shapeState.alternatives.map((alternative) => (
            <ChordCard
              key={`${alternative.ref.origin}-${alternative.ref.id}`}
              compact
              symbol={alternative.symbol}
              title={alternative.name}
              subtitle={`Variação ${alternative.variationNumber}`}
              onPress={() => navigation.replace(APP_ROUTES.chordDetail(alternative.ref.id))}
            />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ actions: { gap: 10 }, alternatives: { gap: 12 } });
