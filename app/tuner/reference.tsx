import { AppButton, AppHeader, EmptyState, ScreenContainer } from "@/components/ui";
import { APP_ROUTES } from "@/constants/routes";
import { useActiveTuning } from "@/hooks/useActiveTuning";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";

export default function ReferenceSoundsScreen() {
  const navigation = useSafeNavigation();
  const activeTuning = useActiveTuning();

  return (
    <ScreenContainer scroll maxWidth={720}>
      <AppHeader eyebrow="Sons de referência" title="Escute as cordas" subtitle="Uma faixa por nota e por par" onBackPress={() => navigation.safeBack(APP_ROUTES.tuner)} activeTuningValue={activeTuning.tuning?.name ?? "Não definida"} />
      <EmptyState
        title="Sons de referência não instalados"
        description={activeTuning.tuning ? "A afinação está disponível, mas ainda não há arquivos de áudio locais validados para estas cordas." : "Escolha uma afinação e instale os arquivos de áudio locais para usar esta modalidade."}
        actionLabel="Revisar afinações"
        onActionPress={() => navigation.push(APP_ROUTES.tunings)}
        secondaryActionLabel="Abrir afinador cromático"
        onSecondaryActionPress={() => navigation.push(APP_ROUTES.tunerChromatic)}
      />
      <AppButton fullWidth variant="secondary" onPress={() => navigation.push(APP_ROUTES.tunerGuided)}>Abrir modo guiado</AppButton>
    </ScreenContainer>
  );
}
