import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { usePostsStore } from "@/stores/usePostsStore";
import { setSelectedCampus } from "@/lib/campus-storage";
import {
  School,
  Search,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Globe,
} from "lucide-react-native";

const POPULAR_CAMPUSES = [
  "Stanford University",
  "UC Berkeley",
  "UCLA",
  "Harvard University",
  "MIT",
  "Columbia University",
  "NYU",
  "UT Austin",
  "University of Michigan",
  "Georgia Tech",
  "University of Washington",
  "Cornell University",
];

export default function CampusSelectScreen() {
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

  const filteredCampuses = POPULAR_CAMPUSES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-5 pt-3 pb-4 border-b border-slate-900 flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-bold tracking-tight text-white">
              Select Your Campus
            </Text>
            <Text className="text-xs text-slate-400 mt-0.5">
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
            className="size-9 rounded-full bg-slate-900 border border-slate-800 items-center justify-center"
          >
            <X size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <View className="p-5 flex-1">
          {/* Custom Input */}
          <View className="mb-5">
            <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Search or enter custom university
            </Text>
            <View className="flex-row items-center bg-slate-900/90 border border-slate-800 rounded-2xl px-3.5 py-3 gap-2.5">
              <Search size={18} color="#64748b" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="e.g. Stanford University"
                placeholderTextColor="#64748b"
                className="flex-1 text-sm text-white font-medium"
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
                  className="bg-indigo-600 px-3 py-1.5 rounded-xl flex-row items-center gap-1"
                >
                  <Text className="text-xs font-semibold text-white">Select</Text>
                  <ArrowRight size={12} color="#ffffff" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Quick Option: Global / All Campuses */}
          <TouchableOpacity
            onPress={() => handleSelectCampus("All Campuses")}
            className="mb-4 flex-row items-center justify-between p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40"
          >
            <View className="flex-row items-center gap-3">
              <View className="size-10 rounded-xl bg-indigo-900/60 border border-indigo-700/50 items-center justify-center">
                <Globe size={20} color="#818cf8" />
              </View>
              <View>
                <Text className="text-sm font-semibold text-white">
                  All Campuses (Global)
                </Text>
                <Text className="text-xs text-indigo-300/80">
                  Browse unfiltered confessions everywhere
                </Text>
              </View>
            </View>
            {myCampus === "All Campuses" && (
              <Check size={18} color="#818cf8" />
            )}
          </TouchableOpacity>

          {/* Popular Campuses Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Popular Universities
            </Text>
            <Sparkles size={14} color="#a855f7" />
          </View>

          {/* List */}
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
                      ? "bg-slate-800/90 border-indigo-500/60"
                      : "bg-slate-900/60 border-slate-800/80"
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className={`size-8 rounded-lg items-center justify-center ${
                        isSelected
                          ? "bg-indigo-600/30 text-indigo-400"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <School
                        size={16}
                        color={isSelected ? "#a5b4fc" : "#94a3b8"}
                      />
                    </View>
                    <Text
                      className={`text-sm font-medium ${
                        isSelected ? "text-white font-semibold" : "text-slate-300"
                      }`}
                    >
                      {item}
                    </Text>
                  </View>
                  {isSelected && <Check size={16} color="#818cf8" />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
