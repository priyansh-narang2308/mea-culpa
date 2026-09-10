import { usePostsStore } from "@/stores/usePostsStore";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CampusSelectScreen = () => {
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const isChanging = mode === "change";

  const [customCampus, setCustomCampus] = useState("");

  const setMyCampus = usePostsStore((state) => state.setMyCampus);

  return (
   <SafeAreaView>
    
   </SafeAreaView>
  );
};

export default CampusSelectScreen;
