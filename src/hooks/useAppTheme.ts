import { AppThemeContext } from '@/theme/context';
import { useContext } from 'react';

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (context === undefined) {
    throw new Error('useAppTheme deve ser usado dentro de AppThemeProvider.');
  }

  return context;
}
