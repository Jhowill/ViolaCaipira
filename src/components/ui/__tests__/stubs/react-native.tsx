import React, { type PropsWithChildren, type ReactNode } from "react";

type StyleValue = Record<string, unknown> | null | undefined | false | ReadonlyArray<StyleValue>;

function isStyleArray(style: StyleValue): style is ReadonlyArray<StyleValue> {
  return Array.isArray(style);
}

function flattenStyle(style: StyleValue): Record<string, unknown> {
  if (style === null || style === undefined || style === false) {
    return {};
  }

  if (isStyleArray(style)) {
    const resolvedStyle: Record<string, unknown> = {};

    for (const item of style) {
      const flattenedStyle = flattenStyle(item);

      for (const [key, value] of Object.entries(flattenedStyle)) {
        resolvedStyle[key] = value;
      }
    }

    return resolvedStyle;
  }

  return style;
}

function createHostComponent<Name extends string>(name: Name) {
  function HostComponent({ children, ...props }: PropsWithChildren<Record<string, unknown>>) {
    const renderedChildren =
      typeof children === "function" ? (children as (state: { pressed: boolean; focused: boolean; hovered: boolean }) => ReactNode)({ pressed: false, focused: false, hovered: false }) : children;

    return React.createElement(name, props, renderedChildren);
  }

  HostComponent.displayName = name;

  return HostComponent;
}

export const View = createHostComponent("View");
export const Text = createHostComponent("Text");
export const TextInput = createHostComponent("TextInput");
export const Pressable = createHostComponent("Pressable");
export const ScrollView = createHostComponent("ScrollView");
export const Modal = createHostComponent("Modal");
export const ActivityIndicator = createHostComponent("ActivityIndicator");
export const KeyboardAvoidingView = createHostComponent("KeyboardAvoidingView");

export const Platform = {
  OS: "web",
  select<T>(spec: { readonly android?: T; readonly ios?: T; readonly web?: T; readonly default?: T }): T | undefined {
    return spec.web ?? spec.default ?? spec.ios ?? spec.android;
  },
};

export const Dimensions = {
  get(_key: "window" | "screen") {
    return {
      width: 390,
      height: 844,
      scale: 1,
      fontScale: 1,
    };
  },
};

export const StyleSheet = {
  create<T extends Record<string, unknown>>(styles: T): T {
    return styles;
  },
  flatten(style: StyleValue) {
    return flattenStyle(style);
  },
  absoluteFill: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
};

export type PressableStateCallbackType = {
  readonly pressed: boolean;
  readonly focused?: boolean;
  readonly hovered?: boolean;
};
