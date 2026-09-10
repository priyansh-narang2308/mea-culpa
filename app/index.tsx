import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-950 px-6">
      <View className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl items-center">
        <Text className="text-2xl font-bold text-emerald-400 mb-2">
          NativeWind Working!
        </Text>
        <Text className="text-sm text-slate-400 text-center">
          Tailwind CSS classes are properly configured with Expo SDK 57.
        </Text>
      </View>
    </View>
  );
}
