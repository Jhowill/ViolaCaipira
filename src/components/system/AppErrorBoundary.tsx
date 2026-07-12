import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

import { ErrorState, ScreenContainer } from "@/components/ui";

interface AppErrorBoundaryProps {
  readonly children: ReactNode;
}

interface AppErrorBoundaryState {
  readonly failed: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { failed: true };
  }

  override componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // A futura telemetria deve registrar somente códigos, nunca conteúdo musical do usuário.
  }

  private reset = () => {
    this.setState({ failed: false });
  };

  override render() {
    if (this.state.failed) {
      return (
        <ScreenContainer padded background="default">
          <ErrorState
            title="Esta tela encontrou um problema"
            description="Seus dados locais não foram apagados. Você pode tentar abrir a tela novamente."
            actionLabel="Tentar novamente"
            onActionPress={this.reset}
          />
        </ScreenContainer>
      );
    }

    return this.props.children;
  }
}
