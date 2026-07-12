import type { ReactNode } from "react";
import type { PressableProps } from "react-native";

export type ScreenContainerVariant = "scroll" | "fixed" | "stage" | "form" | "centered";
export type ScreenContainerBackground = "default" | "subtle" | "surface";

export interface ScreenContainerProps {
  readonly children: ReactNode;
  readonly variant?: ScreenContainerVariant;
  readonly scroll?: boolean;
  readonly padded?: boolean;
  readonly maxWidth?: number;
  readonly keyboardAvoiding?: boolean;
  readonly background?: ScreenContainerBackground;
  readonly testID?: string;
}

export type AppHeaderVariant = "default" | "compact" | "transparent" | "stage" | "search";

export interface AppHeaderAction {
  readonly label?: string;
  readonly accessibilityLabel: string;
  readonly onPress?: () => void;
  readonly icon?: ReactNode;
  readonly disabled?: boolean;
}

export interface AppHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly eyebrow?: string;
  readonly variant?: AppHeaderVariant;
  readonly centerTitle?: boolean;
  readonly onBackPress?: () => void;
  readonly backAccessibilityLabel?: string;
  readonly primaryAction?: AppHeaderAction;
  readonly secondaryAction?: AppHeaderAction;
  readonly activeTuningLabel?: string;
  readonly activeTuningValue?: string;
}

export type AppButtonVariant = "primary" | "secondary" | "tertiary" | "destructive" | "icon" | "floating";
export type AppButtonSize = "sm" | "md" | "lg";

export interface AppButtonProps
  extends Omit<PressableProps, "accessibilityRole" | "children" | "style"> {
  readonly children?: ReactNode;
  readonly variant?: AppButtonVariant;
  readonly size?: AppButtonSize;
  readonly icon?: ReactNode;
  readonly iconPosition?: "left" | "right";
  readonly fullWidth?: boolean;
  readonly loading?: boolean;
  readonly success?: boolean;
  readonly accessibilityLabel?: string;
  readonly accessibilityHint?: string;
}

export type AppCardVariant =
  | "default"
  | "interactive"
  | "selected"
  | "informative"
  | "alert"
  | "premium"
  | "music"
  | "chord"
  | "rhythm";

export type AppCardPadding = "sm" | "md" | "lg";

export interface AppCardProps extends Omit<PressableProps, "accessibilityRole" | "children" | "style"> {
  readonly children?: ReactNode;
  readonly title?: string;
  readonly subtitle?: string;
  readonly description?: string;
  readonly icon?: ReactNode;
  readonly footer?: ReactNode;
  readonly variant?: AppCardVariant;
  readonly padding?: AppCardPadding;
  readonly selected?: boolean;
  readonly fullWidth?: boolean;
  readonly disabled?: boolean;
  readonly accessibilityLabel?: string;
}

export interface SectionHeaderProps {
  readonly title: string;
  readonly description?: string;
  readonly actionLabel?: string;
  readonly onActionPress?: () => void;
  readonly actionAccessibilityLabel?: string;
}

export type ChipVariant = "filter" | "selection" | "status" | "tag" | "chord" | "note";
export type ChipSize = "sm" | "md";

export interface ChipProps extends Omit<PressableProps, "accessibilityRole" | "children" | "style"> {
  readonly label: string;
  readonly variant?: ChipVariant;
  readonly size?: ChipSize;
  readonly selected?: boolean;
  readonly disabled?: boolean;
  readonly icon?: ReactNode;
  readonly removable?: boolean;
  readonly onRemovePress?: () => void;
  readonly accessibilityLabel?: string;
}

export interface SegmentedControlOption<T extends string = string> {
  readonly label: string;
  readonly value: T;
  readonly accessibilityLabel?: string;
  readonly disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  readonly options: ReadonlyArray<SegmentedControlOption<T>>;
  readonly value: T;
  readonly onValueChange: (value: T) => void;
  readonly accessibilityLabel?: string;
}

export type LoadingStateVariant = "screen" | "list" | "card" | "inline";

export interface LoadingStateProps {
  readonly title?: string;
  readonly description?: string;
  readonly variant?: LoadingStateVariant;
  readonly rows?: number;
  readonly accessibilityLabel?: string;
}

export interface EmptyStateProps {
  readonly title: string;
  readonly description: string;
  readonly actionLabel?: string;
  readonly onActionPress?: () => void;
  readonly secondaryActionLabel?: string;
  readonly onSecondaryActionPress?: () => void;
  readonly icon?: ReactNode;
  readonly accessibilityLabel?: string;
}

export interface ErrorStateProps {
  readonly title: string;
  readonly description: string;
  readonly details?: string;
  readonly actionLabel?: string;
  readonly onActionPress?: () => void;
  readonly secondaryActionLabel?: string;
  readonly onSecondaryActionPress?: () => void;
  readonly icon?: ReactNode;
  readonly accessibilityLabel?: string;
}
