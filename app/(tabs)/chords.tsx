import { ChordCard } from "@/components/chords/ChordCard";
import { ChordDiagram } from "@/components/chords/ChordDiagram";
import { ActiveTuningPill } from "@/components/navigation/ActiveTuningPill";
import {
  AppButton,
  AppCard,
  Chip,
  EmptyState,
  ErrorState,
  LoadingState,
  ScreenContainer,
  SearchField,
  SectionHeader,
} from "@/components/ui";
import { APP_ROUTES } from "@/constants/routes";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useChords } from "@/hooks/useChords";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useTunings } from "@/hooks/useTunings";
import { humanizeSlug } from "@/utils/formatters";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const notes = ["C", "D", "E", "F", "G", "A", "B", "C♯", "D♯", "F♯", "G♯", "A♯"] as const;
const qualities = [
  { label: "Maior", suffix: "" },
  { label: "Menor", suffix: "m" },
  { label: "7", suffix: "7" },
  { label: "maj7", suffix: "maj7" },
  { label: "sus4", suffix: "sus4" },
  { label: "add9", suffix: "add9" },
] as const;

export default function ChordsTabScreen() {
  const navigation = useSafeNavigation();
  const { theme } = useAppTheme();
  const tuningsState = useTunings();
  const [selectedRoot, setSelectedRoot] = useState("D");
  const [selectedQuality, setSelectedQuality] = useState("");
  const activeTuning = tuningsState.tunings.find((tuning) => tuning.isActive);
  const tuning = activeTuning?.ref ?? null;
  const chordsState = useChords({ tuning, initialQuery: "D" });

  const selectChord = (root: string, suffix: string) => {
    setSelectedRoot(root);
    setSelectedQuality(suffix);
    chordsState.setQuery(`${root}${suffix}`);
  };

  return (
    <ScreenContainer scroll background="default">
      <AppCard
        variant="informative"
        padding="md"
        title="Acordes"
        subtitle="Formas vinculadas à afinação escolhida"
        description="A busca consulta apenas formas verificadas, calculadas ou pessoais registradas no banco."
        icon={<Text style={[theme.typography.titleSmall, { color: theme.colors.primary }]}>◫</Text>}
      />

      <ActiveTuningPill
        value={activeTuning?.name ?? (tuningsState.status === "loading" ? "Carregando…" : "Não definida")}
        detail={activeTuning ? "Formas compatíveis com a afinação ativa" : "Escolha uma afinação antes de consultar formas"}
        onPress={() => navigation.replace(APP_ROUTES.tunings)}
      />

      <SearchField
        value={chordsState.query}
        onChangeText={chordsState.setQuery}
        placeholder="Buscar acorde, por exemplo Dm7"
        onFilterPress={() => selectChord("D", "")}
      />

      <View style={styles.chipRow}>
        {notes.map((note) => (
          <Chip
            key={note}
            label={note}
            onPress={() => selectChord(note, selectedQuality)}
            variant="note"
            selected={selectedRoot === note}
          />
        ))}
      </View>

      <View style={styles.chipRow}>
        {qualities.map((quality) => (
          <Chip
            key={quality.label}
            label={quality.label}
            onPress={() => selectChord(selectedRoot, quality.suffix)}
            variant="chord"
            selected={selectedQuality === quality.suffix}
          />
        ))}
      </View>

      <SectionHeader
        title={chordsState.symbol ? `Formas para ${chordsState.symbol}` : "Formas de acorde"}
        description={chordsState.shapes.length === 1 ? "1 forma compatível." : `${chordsState.shapes.length} formas compatíveis.`}
      />

      {chordsState.status === "loading" ? (
        <LoadingState variant="list" rows={3} title="Carregando acordes" />
      ) : chordsState.status === "error" ? (
        <ErrorState
          title="Não foi possível consultar os acordes"
          description="A afinação e o banco local permanecem inalterados."
          details={chordsState.error?.message}
          onActionPress={() => void chordsState.refresh()}
        />
      ) : chordsState.shapes.length === 0 ? (
        <EmptyState
          title={!activeTuning ? "Escolha uma afinação" : chordsState.query ? `Nenhuma forma encontrada para ${chordsState.query}` : "Escolha um acorde"}
          description={!activeTuning
            ? "As formas dependem da afinação ativa e não são substituídas por dados demonstrativos."
            : "Formas demonstrativas não são usadas como catálogo definitivo. Escolha outra cifra ou aguarde conteúdo musical validado."}
          actionLabel="Revisar afinação"
          onActionPress={() => navigation.push(APP_ROUTES.tunings)}
        />
      ) : (
        <View style={styles.list}>
          {chordsState.shapes.map((shape) => (
            <ChordCard
              key={`${shape.ref.origin}-${shape.ref.id}`}
              symbol={shape.symbol}
              title={shape.name}
              subtitle={`${humanizeSlug(shape.difficulty, shape.difficulty)} • variação ${shape.variationNumber}`}
              description={shape.notes ?? "Forma vinculada à afinação ativa."}
              favorite={shape.isFavorite}
              selected={shape.isRecommended}
              badges={[
                {
                  label: humanizeSlug(shape.verificationStatus, shape.verificationStatus),
                  tone: shape.verificationStatus === "verified" ? "success" : "warning",
                },
              ]}
              diagram={<ChordDiagram shape={{ ...shape, id: shape.ref.id }} density="compact" mode="five_courses" />}
              onPress={() =>
                navigation.push({
                  pathname: "/chords/[shapeId]",
                  params: { shapeId: shape.ref.id, origin: shape.ref.origin },
                })
              }
            />
          ))}
        </View>
      )}

      <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.tuner)} variant="secondary">
        Ajustar afinação antes de estudar
      </AppButton>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  list: { gap: 12 },
});
