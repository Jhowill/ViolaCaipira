import { useAppBootstrap } from "@/hooks/useAppBootstrap";
import { RecoveryScreen } from "@/screens/system/RecoveryScreen";

export default function RecoveryRoute() {
  const bootstrap = useAppBootstrap();

  return (
    <RecoveryScreen
      fatal={bootstrap.phase === "fatal_error"}
      onRetry={() => void bootstrap.retry()}
      technicalDetails={
        bootstrap.error
          ? `${bootstrap.error.name}: ${bootstrap.error.message}`
          : "Nenhum detalhe técnico disponível."
      }
    />
  );
}
