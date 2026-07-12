import { APP_ROUTE_GROUPS } from "@/constants/routes";
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href={APP_ROUTE_GROUPS.tabs} />;
}
