import "../global.css";
import { Stack } from "expo-router";
import { PortalHost } from "@rn-primitives/portal";

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
      <PortalHost />
    </>
  );
}
