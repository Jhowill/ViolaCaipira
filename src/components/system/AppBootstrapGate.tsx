import type { PropsWithChildren } from "react";

import { ErrorState, LoadingState, ScreenContainer } from "@/components/ui";
import { useAppBootstrap } from "@/hooks/useAppBootstrap";

const phaseMessages = {
  booting: "Preparando o aplicativo",
  checking_database: "Verificando os dados locais",
  migrating_database: "Atualizando o banco local",
  restoring_preferences: "Restaurando suas preferências",
} as const;

export function AppBootstrapGate({ children }: PropsWithChildren) {
  const bootstrap = useAppBootstrap();

  if (bootstrap.phase === "ready") {
    return children;
  }

  if (bootstrap.phase === "recoverable_error" || bootstrap.phase === "fatal_error") {
    const fatal = bootstrap.phase === "fatal_error";

    return (
      <ScreenContainer padded background="default">
        <ErrorState
          title={fatal ? "Não foi possível preparar o aplicativo" : "Tivemos um problema ao iniciar"}
          description={
            fatal
              ? "Seus dados foram preservados. Feche o aplicativo e tente novamente."
              : "Seus dados continuam seguros no aparelho. Tente iniciar novamente."
          }
          actionLabel="Tentar novamente"
          onActionPress={fatal ? undefined : () => void bootstrap.retry()}
          accessibilityLabel="Erro ao preparar o aplicativo"
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer padded background="default">
      <LoadingState
        title={phaseMessages[bootstrap.phase]}
        description="Tudo funciona localmente e sem depender de internet."
        accessibilityLabel={phaseMessages[bootstrap.phase]}
        rows={3}
      />
    </ScreenContainer>
  );
}
