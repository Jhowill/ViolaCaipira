import { APP_ROUTES } from "@/constants/routes";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { AppCard, Chip, ScreenContainer, SearchField, SectionHeader, AppButton } from "@/components/ui";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const notes = ["C", "D", "E", "F", "G", "A", "B", "C♯", "D♯", "F♯", "G♯", "A♯"] as const;
const qualities = ["Maior", "Menor", "7", "maj7", "sus4", "add9"] as const;

const shapes = [
  { id: "d-maior", symbol: "D", quality: "Maior", description: "Forma aberta clara e prática", status: "verified" },
  { id: "bm", symbol: "Bm", quality: "Menor", description: "Pestana curta com leitura fácil", status: "calculated" },
  { id: "a7", symbol: "A7", quality: "7", description: "Sólido para progressões de viola", status: "verified" },
] as const;

export default function ChordsTabScreen() {
  const navigation = useSafeNavigation();
  const { theme } = useAppTheme();
  const [query, setQuery] = useState("");

  const filteredShapes = shapes.filter((shape) =>
    `${shape.symbol} ${shape.quality} ${shape.description}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <ScreenContainer scroll background="default">
      <AppCard
        variant="informative"
        padding="md"
        title="Acordes"
        subtitle="Formas revisadas e compatíveis com a afinação ativa"
        description="Selecione uma nota e refine pela qualidade para achar a posição certa mais rápido."
        icon={<Text style={[theme.typography.titleSmall, { color: theme.colors.primary }]}>◫</Text>}
      />

      <View style={styles.headerBlock}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar acorde"
          onFilterPress={() => navigation.replace(APP_ROUTES.chords)}
        />
      </View>

      <View style={styles.chipRow}>
        {notes.map((note, index) => (
          <Chip
            key={note}
            label={note}
            variant="note"
            selected={index === 1}
          />
        ))}
      </View>

      <View style={styles.chipRow}>
        {qualities.map((quality, index) => (
          <Chip
            key={quality}
            label={quality}
            variant="chord"
            selected={index === 0}
          />
        ))}
      </View>

      <SectionHeader title="Formas verificadas" description="A base visual segue o mesmo padrão dos diagramas do app." />

      <View style={styles.list}>
        {filteredShapes.map((shape) => (
          <AppCard
            key={shape.id}
            variant="chord"
            padding="lg"
            title={shape.symbol}
            subtitle={`${shape.quality} • ${shape.status}`}
            description={shape.description}
            icon={<Text style={[theme.typography.titleSmall, { color: theme.colors.primary }]}>♩</Text>}
            onPress={() => navigation.push(APP_ROUTES.chordDetail(shape.id))}
            footer={
              <View style={styles.cardFooter}>
                <Chip label={shape.status} variant={shape.status === "verified" ? "status" : "tag"} />
                <Chip label="Cebolão em Ré" variant="selection" />
              </View>
            }
          />
        ))}
      </View>

      <AppButton fullWidth onPress={() => navigation.push(APP_ROUTES.tuner)} variant="secondary">
        Ajustar afinação antes de estudar
      </AppButton>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    marginTop: 4,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  list: {
    gap: 12,
  },
  cardFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
