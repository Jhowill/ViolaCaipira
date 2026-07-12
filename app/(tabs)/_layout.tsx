import { BottomTabBar } from "@/components/navigation/BottomTabBar";
import { MAIN_TABS } from "@/constants/routes";
import { useAppTheme } from "@/hooks/useAppTheme";
import { TabSlot, useTabsWithTriggers } from "expo-router/ui";
import { StyleSheet, View } from "react-native";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function TabsLayout() {
  const { theme } = useAppTheme();
  const { NavigationContent } = useTabsWithTriggers({
    triggers: MAIN_TABS.map((item) => ({
      type: "internal" as const,
      name: item.name,
      href: item.href,
    })),
    backBehavior: "initialRoute",
  });

  return (
    <NavigationContent>
      <View style={[styles.shell, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <TabSlot />
        </View>
        <BottomTabBar />
      </View>
    </NavigationContent>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
