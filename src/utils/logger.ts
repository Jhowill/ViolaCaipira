export function logBootstrapError(error: Error): void {
  if (__DEV__) {
    console.error(`[bootstrap] ${error.name}: ${error.message}`);
  }
}
