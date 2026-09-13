import "../global.css";
import { Stack } from "expo-router";
import { PortalHost } from "@rn-primitives/portal";
import { Toaster } from "sonner-native";

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen
          name="campus-select"
          options={{
            presentation: "pageSheet",
            headerShown: false,
          }}
        />
      </Stack>
      <Toaster position="top-center" />
      <PortalHost />
    </>
  );
}
