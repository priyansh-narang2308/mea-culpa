import { setSelectedCampus } from "@/lib/campus-storage";
import { useAppTheme } from "@/lib/theme-manager";
import { usePostsStore } from "@/stores/usePostsStore";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowRight,
  Check,
  Globe,
  School,
  Search,
  Sparkles,
  X,
} from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CAMPUSES } from "@/constants/campuses";

export default function CampusSelectScreen() {
  const { isDark } = useAppTheme();
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const isChanging = mode === "change";

  const [search, setSearch] = useState("");
  const myCampus = usePostsStore((state) => state.myCampus);
  const setMyCampus = usePostsStore((state) => state.setMyCampus);

  const handleSelectCampus = async (campusName: string) => {
    if (!campusName.trim()) return;
    const cleanName = campusName.trim();
    await setSelectedCampus(cleanName);
    setMyCampus(cleanName);

    if (isChanging) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  const filteredCampuses = CAMPUSES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-black" : "bg-white"}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#000000" : "#ffffff"}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View
          className={`px-5 pt-3 pb-4 border-b flex-row items-center justify-between ${
            isDark ? "bg-black border-zinc-900" : "bg-white border-zinc-100"
          }`}
        >
          <View>
            <Text
              className={`text-xl font-bold tracking-tight ${
                isDark ? "text-white" : "text-zinc-950"
              }`}
            >
              Select Your Campus
            </Text>
            <Text
              className={`text-xs mt-0.5 ${
                isDark ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              Read & confess anonymously within your university
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (isChanging) {
                router.back();
              } else {
                router.replace("/home");
              }
            }}
            className={`size-9 rounded-full items-center justify-center border ${
              isDark
                ? "bg-zinc-900 border-zinc-800"
                : "bg-zinc-100 border-zinc-200"
            }`}
          >
            <X size={18} color={isDark ? "#a1a1aa" : "#52525b"} />
          </TouchableOpacity>
        </View>

        <View className="p-5 flex-1">
          <View className="mb-5">
            <Text
              className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                isDark ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              Search or enter custom university
            </Text>
            <View
              className={`flex-row items-center rounded-2xl px-3.5 py-3 gap-2.5 border ${
                isDark
                  ? "bg-zinc-900/90 border-zinc-800"
                  : "bg-zinc-50 border-zinc-200"
              }`}
            >
              <Search size={18} color={isDark ? "#71717a" : "#a1a1aa"} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="e.g. Stanford University"
                placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                className={`flex-1 text-sm font-medium ${
                  isDark ? "text-white" : "text-zinc-900"
                }`}
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (search.trim()) {
                    handleSelectCampus(search.trim());
                  }
                }}
              />
              {search.trim().length > 0 && (
                <TouchableOpacity
                  onPress={() => handleSelectCampus(search.trim())}
                  className="bg-rose-600 px-3 py-1.5 rounded-xl flex-row items-center gap-1"
                >
                  <Text className="text-xs font-semibold text-white">
                    Select
                  </Text>
                  <ArrowRight size={12} color="#ffffff" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleSelectCampus("All Campuses")}
            className={`mb-4 flex-row items-center justify-between p-4 rounded-2xl border ${
              isDark
                ? "bg-rose-950/20 border-rose-900/40"
                : "bg-rose-50/70 border-rose-200"
            }`}
          >
            <View className="flex-row items-center gap-3">
              <View
                className={`size-10 rounded-xl items-center justify-center border ${
                  isDark
                    ? "bg-rose-950/40 border-rose-800/40"
                    : "bg-rose-100 border-rose-200"
                }`}
              >
                <Globe size={20} color={isDark ? "#fb7185" : "#e11d48"} />
              </View>
              <View>
                <Text
                  className={`text-sm font-semibold ${
                    isDark ? "text-white" : "text-zinc-900"
                  }`}
                >
                  All Campuses (Global)
                </Text>
                <Text
                  className={`text-xs ${
                    isDark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  Browse unfiltered confessions everywhere
                </Text>
              </View>
            </View>
            {myCampus === "All Campuses" && (
              <Check size={18} color={isDark ? "#fb7185" : "#e11d48"} />
            )}
          </TouchableOpacity>

          <View className="flex-row items-center justify-between mb-2">
            <Text
              className={`text-xs font-semibold uppercase tracking-wider ${
                isDark ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              Popular Universities
            </Text>
            <Sparkles size={14} color={isDark ? "#fb7185" : "#e11d48"} />
          </View>

          <FlatList
            data={filteredCampuses}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = myCampus === item;
              return (
                <TouchableOpacity
                  onPress={() => handleSelectCampus(item)}
                  className={`flex-row items-center justify-between p-3.5 mb-2 rounded-2xl border transition-all ${
                    isSelected
                      ? isDark
                        ? "bg-rose-950/30 border-rose-500/60"
                        : "bg-rose-50 border-rose-400"
                      : isDark
                        ? "bg-zinc-900/60 border-zinc-800/80"
                        : "bg-white border-zinc-200"
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className={`size-8 rounded-lg items-center justify-center ${
                        isSelected
                          ? "bg-rose-600/20"
                          : isDark
                            ? "bg-zinc-800"
                            : "bg-zinc-100"
                      }`}
                    >
                      <School
                        size={16}
                        color={
                          isSelected
                            ? isDark
                              ? "#fb7185"
                              : "#e11d48"
                            : isDark
                              ? "#71717a"
                              : "#a1a1aa"
                        }
                      />
                    </View>
                    <Text
                      className={`text-sm ${
                        isSelected
                          ? isDark
                            ? "text-white font-semibold"
                            : "text-zinc-950 font-semibold"
                          : isDark
                            ? "text-zinc-300 font-medium"
                            : "text-zinc-700 font-medium"
                      }`}
                    >
                      {item}
                    </Text>
                  </View>
                  {isSelected && (
                    <Check size={16} color={isDark ? "#fb7185" : "#e11d48"} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
