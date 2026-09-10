import { getSelectedCampus } from "@/lib/campus-storage";
import { usePostsStore } from "@/stores/usePostsStore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function Index() {
  const [composerVisible, setComposerVisible] = useState(false);
  const posts = usePostsStore((state) => state.posts);
  const loading = usePostsStore((state) => state.loading);
  const myCampus = usePostsStore((state) => state.myCampus);
  const fetchPosts = usePostsStore((state) => state.fetchPosts);
  const showAllCampuses = usePostsStore((state) => state.showAllCampuses);
  const setMyCampus = usePostsStore((state) => state.setMyCampus);
  const toggleShowAllCampuses = usePostsStore(
    (state) => state.toggleShowAllCampuses,
  );

  const loadingMore = usePostsStore((state) => state.loadingMore);
  const hasMore = usePostsStore((state) => state.hasMore);

  useEffect(() => {
    async () => {
      const campus = await getSelectedCampus();
      if (!campus) {
        router.reload("/campus-select");
        return;
      }

      setMyCampus(campus);
      await usePostsStore.getState().loadUserReactions();
      await usePostsStore.getState().loadReportedPosts();
    };
  });

  useEffect(() => {
    if (!myCampus) {
      return;
    }

    fetchPosts();
    const unsubscribe = usePostsStore.getState().subscribeToRealTime();

    return unsubscribe;
  }, [myCampus]);

  useEffect(() => {
    const unsubscribe = usePostsStore.getState().subscribeToRealTime();

    return () => {
      unsubscribe();
    };
  }, [myCampus]);

  useEffect(() => {
    if (myCampus) {
      fetchPosts();
    }
  }, [showAllCampuses]);

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
