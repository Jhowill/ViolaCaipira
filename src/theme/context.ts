import type { AppThemeContextValue } from '@/types/theme';
import { createContext } from 'react';

export const AppThemeContext = createContext<AppThemeContextValue | undefined>(undefined);
