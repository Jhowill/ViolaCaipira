import { APP_ROUTES } from "@/constants/routes";
import { RoutePlaceholder } from "@/components/navigation/RoutePlaceholder";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";

export default function NotFoundScreen() {
  const navigation = useSafeNavigation();

  return (
    <RoutePlaceholder
      eyebrow="404"
      title="Página não encontrada"
      subtitle="Esse caminho ainda não existe neste shell."
      heroTitle="Voltamos para o mapa"
      heroDescription="Você pode retornar ao início, revisar as cifras ou abrir os estudos sem perder o fluxo."
      heroVariant="alert"
      primaryActionLabel="Voltar ao início"
      onPrimaryActionPress={navigation.goHome}
      secondaryActionLabel="Abrir cifras"
      onSecondaryActionPress={() => navigation.replace(APP_ROUTES.songs)}
    />
  );
}
