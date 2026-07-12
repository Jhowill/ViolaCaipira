import { useAppTheme } from "@/hooks/useAppTheme";
import type { ScreenContainerProps } from "@/types/ui";
import { useMemo } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

const tabletBreakpoint = 600;

function resolveBackgroundColor(background: ScreenContainerProps["background"], colors: ReturnType<typeof useAppTheme>["theme"]["colors"]) {
  switch (background) {
    case "surface":
      return colors.surface;
    case "subtle":
      return colors.backgroundSubtle;
    default:
      return colors.background;
  }
}

export function ScreenContainer({
  children,
  variant,
  scroll,
  padded = true,
  maxWidth = 720,
  keyboardAvoiding,
  background = "default",
  testID,
}: ScreenContainerProps) {
  const { theme } = useAppTheme();
  const windowWidth = Dimensions.get("window").width;
  const isTablet = windowWidth >= tabletBreakpoint;
  const resolvedVariant = variant ?? (scroll ? "scroll" : "fixed");
  const shouldScroll = resolvedVariant === "scroll" || resolvedVariant === "form";
  const shouldCenter = resolvedVariant === "centered";
  const shouldAvoidKeyboard = keyboardAvoiding ?? resolvedVariant === "form";
  const edges = useMemo<Edge[]>(() => ["top", "bottom", "left", "right"], []);

  const horizontalPadding = padded ? (isTablet ? theme.spacing[6] : theme.spacing[4]) : 0;
  const verticalPadding = padded ? theme.spacing[4] : 0;
  const bottomPadding = padded ? (shouldScroll ? theme.spacing[8] : theme.spacing[4]) : 0;
  const backgroundColor = resolveBackgroundColor(background, theme.colors);

  const contentStyle = [
    styles.content,
    shouldCenter && styles.centeredContent,
    {
      paddingHorizontal: horizontalPadding,
      paddingTop: verticalPadding,
      paddingBottom: bottomPadding,
      maxWidth,
      backgroundColor: "transparent",
    },
  ];

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.safeArea, { backgroundColor }]}
      testID={testID}
    >
      <KeyboardAvoidingView
        behavior={shouldAvoidKeyboard && Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        {shouldScroll ? (
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              shouldCenter && styles.scrollCenteredContent,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[contentStyle, styles.scrollInner]}>{children}</View>
          </ScrollView>
        ) : (
          <View style={styles.flex}>
            <View style={[contentStyle, styles.fixedInner]}>{children}</View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollCenteredContent: {
    justifyContent: "center",
  },
  content: {
    width: "100%",
    alignSelf: "center",
  },
  scrollInner: {
    flexGrow: 1,
  },
  fixedInner: {
    flex: 1,
  },
  centeredContent: {
    alignItems: "center",
    justifyContent: "center",
  },
});
