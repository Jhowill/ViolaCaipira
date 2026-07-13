import { TuningCourseRow } from "@/components/tuning/TuningCourseRow";
import { AppButton, AppCard, AppHeader, EmptyState, ErrorState, LoadingState, ScreenContainer, SectionHeader } from "@/components/ui";
import { APP_ROUTES } from "@/constants/routes";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useTuning } from "@/hooks/useTuning";
import type { ContentOrigin } from "@/types/music";
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

export default function TuningDetailScreen() {
  const navigation = useSafeNavigation();
  const params = useLocalSearchParams<{ tuningId?: string; origin?: string }>();
  const tuningState = useTuning({
    tuningId: params.tuningId ?? "missing",
    origin: resolveOrigin(params.origin),
  });
  const [activating, setActivating] = useState(false);

  const activate = async () => {
    setActivating(true);
    try {
      await tuningState.activate();
      navigation.goHome();
    } catch {
      // O hook troca para o estado de erro e mantém a preferência anterior.
    } finally {
      setActivating(false);
    }
  };

  if (tuningState.status === "loading") {
    return <ScreenContainer variant="centered"><LoadingState title="Carregando afinação" /></ScreenContainer>;
  }

  if (tuningState.status === "error") {
    return (
      <ScreenContainer variant="centered">
        <ErrorState
          title="Não foi possível abrir a afinação"
          description="A preferência ativa não foi alterada."
          details={tuningState.error?.message}
          onActionPress={() => void tuningState.refresh()}
          secondaryActionLabel="Voltar às afinações"
          onSecondaryActionPress={() => navigation.safeBack(APP_ROUTES.tunings)}
        />
      </ScreenContainer>
    );
  }

  if (!tuningState.tuning) {
    return (
      <ScreenContainer variant="centered">
        <EmptyState
          title="Afinação não encontrada"
          description="Ela pode não estar instalada no catálogo local."
          actionLabel="Voltar às afinações"
          onActionPress={() => navigation.safeBack(APP_ROUTES.tunings)}
        />
      </ScreenContainer>
    );
  }

  const tuning = tuningState.tuning;
  return (
    <ScreenContainer scroll maxWidth={640}>
      <AppHeader
        title={tuning.name}
        subtitle={`${humanizeSlug(tuning.verificationStatus, tuning.verificationStatus)} • ${tuning.courses.length} ordens`}
        onBackPress={() => navigation.safeBack(APP_ROUTES.tunings)}
      />

      <AppCard
        variant="informative"
        title={tuning.shortName}
        description={tuning.description ?? "Afinação registrada no banco local."}
      />

      <View style={styles.actions}>
        <AppButton fullWidth loading={activating} onPress={() => void activate()}>
          Ativar esta afinação
        </AppButton>
        <AppButton fullWidth variant="secondary" onPress={() => navigation.push(APP_ROUTES.tunerGuided)}>
          Abrir afinador guiado
        </AppButton>
      </View>

      <SectionHeader title="Cordas abertas" description="Cinco ordens e dez cordas registradas para esta afinação." />
      <View style={styles.courses}>
        {tuning.courses.map((course) => (
          <TuningCourseRow
            key={course.id}
            courseNumber={course.courseNumber}
            strings={course.strings}
            pairType={course.pairType}
            variant="readOnly"
          />
        ))}
      </View>

      {tuning.tensionWarning ? (
        <AppCard variant="alert" title="Tensão e encordoamento" description={tuning.tensionWarning} />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ actions: { gap: 10 }, courses: { gap: 10 } });
