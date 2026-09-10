import { getSelectedCampus } from "@/lib/campus-storage";
import { usePostsStore } from "@/stores/usePostsStore";
import { Post, PostCategory } from "@/types/post";
import { router } from "expo-router";
import {
  ArrowLeft,
  Compass,
  Flag,
  Flame,
  Frown,
  Heart,
  MapPin,
  Plus,
  Send,
  Smile,
  Sparkles,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES: { id: PostCategory | "all"; label: string; color: string }[] =
  [
    { id: "all", label: "All", color: "text-slate-200" },
    { id: "confession", label: "Confession", color: "text-purple-400" },
    { id: "rant", label: "Rant", color: "text-rose-400" },
    { id: "funny", label: "Funny", color: "text-amber-400" },
    { id: "advice", label: "Advice", color: "text-emerald-400" },
  ];

const CATEGORY_STYLES: Record<
  PostCategory,
  { bg: string; text: string; border: string }
> = {
  confession: {
    bg: "bg-purple-950/60",
    text: "text-purple-300",
    border: "border-purple-800/40",
  },
  rant: {
    bg: "bg-rose-950/60",
    text: "text-rose-300",
    border: "border-rose-800/40",
  },
  funny: {
    bg: "bg-amber-950/60",
    text: "text-amber-300",
    border: "border-amber-800/40",
  },
  advice: {
    bg: "bg-emerald-950/60",
    text: "text-emerald-300",
    border: "border-emerald-800/40",
  },
};

function formatRelativeTime(isoString: string): string {
  try {
    const diff = Math.floor(
      (Date.now() - new Date(isoString).getTime()) / 1000,
    );
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return "";
  }
}

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<
    PostCategory | "all"
  >("all");
  const [composerOpen, setComposerOpen] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<PostCategory>("confession");
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    posts,
    loading,
    loadingMore,
    hasMore,
    myCampus,
    showAllCampuses,
    userReactions,
    fetchPosts,
    loadMorePosts,
    toggleReaction,
    addPost,
    reportPost,
    toggleShowAllCampuses,
  } = usePostsStore();

  useEffect(() => {
    const init = async () => {
      if (!myCampus) {
        const saved = await getSelectedCampus();
        if (saved) {
          usePostsStore.getState().setMyCampus(saved);
        }
      }
      await usePostsStore.getState().loadUserReactions();
      await usePostsStore.getState().loadReportedPosts();
    };
    init();
  }, []);

  useEffect(() => {
    fetchPosts();
    const unsub = usePostsStore.getState().subscribeToRealtime();
    return () => {
      unsub();
    };
  }, [myCampus, showAllCampuses]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleCreatePost = async () => {
    if (!newContent.trim()) {
      Alert.alert(
        "Empty Confession",
        "Please enter your confession before posting.",
      );
      return;
    }
    setSubmitting(true);
    const res = await addPost(newContent, newCategory);
    setSubmitting(false);

    if (res.error) {
      Alert.alert("Post Failed", res.error);
    } else {
      setNewContent("");
      setComposerOpen(false);
    }
  };

  const handleReport = (post: Post) => {
    Alert.alert(
      "Report Confession",
      "Are you sure you want to report this post? It will be hidden if multiple users report it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report",
          style: "destructive",
          onPress: async () => {
            await reportPost(post.id);
          },
        },
      ],
    );
  };

  const filteredPosts = posts.filter((p) => {
    if (selectedCategory === "all") return true;
    return p.category === selectedCategory;
  });

  const renderPost = ({ item }: { item: Post }) => {
    const categoryStyle =
      CATEGORY_STYLES[item.category] || CATEGORY_STYLES.confession;
    const activeReaction = userReactions[item.id];

    return (
      <View className="mb-3.5 rounded-2xl border border-slate-800/90 bg-slate-900/90 p-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-2.5">
          <View className="flex-row items-center gap-2">
            <View
              className={`rounded-full px-2.5 py-0.5 border ${categoryStyle.bg} ${categoryStyle.border}`}
            >
              <Text
                className={`text-[11px] font-semibold uppercase tracking-wider ${categoryStyle.text}`}
              >
                {item.category}
              </Text>
            </View>

            {showAllCampuses && item.campus && (
              <View className="flex-row items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5">
                <MapPin size={10} color="#94a3b8" />
                <Text className="text-[10px] font-medium text-slate-300">
                  {item.campus}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center gap-2">
            <Text className="text-[11px] text-slate-500 font-mono">
              {formatRelativeTime(item.created_at)}
            </Text>
            <TouchableOpacity
              onPress={() => handleReport(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Flag size={12} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-[15px] leading-relaxed text-slate-100 font-normal select-text">
          {item.content}
        </Text>

        <View className="mt-3.5 pt-3 border-t border-slate-800/70 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => toggleReaction(item.id, "reaction_heart")}
              className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
                activeReaction === "reaction_heart"
                  ? "bg-rose-950/60 border-rose-500/50"
                  : "bg-slate-800/50 border-slate-800"
              }`}
            >
              <Heart
                size={13}
                color={
                  activeReaction === "reaction_heart" ? "#f43f5e" : "#94a3b8"
                }
                fill={
                  activeReaction === "reaction_heart"
                    ? "#f43f5e"
                    : "transparent"
                }
              />
              <Text
                className={`text-xs font-semibold ${
                  activeReaction === "reaction_heart"
                    ? "text-rose-400"
                    : "text-slate-400"
                }`}
              >
                {item.reaction_heart}
              </Text>
            </TouchableOpacity>

            {/* Shock */}
            <TouchableOpacity
              onPress={() => toggleReaction(item.id, "reaction_shock")}
              className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                activeReaction === "reaction_shock"
                  ? "bg-purple-950/60 border-purple-500/50"
                  : "bg-slate-800/50 border-slate-800"
              }`}
            >
              <Flame
                size={13}
                color={
                  activeReaction === "reaction_shock" ? "#a855f7" : "#94a3b8"
                }
              />
              <Text
                className={`text-xs font-semibold ${
                  activeReaction === "reaction_shock"
                    ? "text-purple-400"
                    : "text-slate-400"
                }`}
              >
                {item.reaction_shock}
              </Text>
            </TouchableOpacity>

            {/* Laugh */}
            <TouchableOpacity
              onPress={() => toggleReaction(item.id, "reaction_laugh")}
              className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                activeReaction === "reaction_laugh"
                  ? "bg-amber-950/60 border-amber-500/50"
                  : "bg-slate-800/50 border-slate-800"
              }`}
            >
              <Smile
                size={13}
                color={
                  activeReaction === "reaction_laugh" ? "#f59e0b" : "#94a3b8"
                }
              />
              <Text
                className={`text-xs font-semibold ${
                  activeReaction === "reaction_laugh"
                    ? "text-amber-400"
                    : "text-slate-400"
                }`}
              >
                {item.reaction_laugh}
              </Text>
            </TouchableOpacity>

            {/* Sad */}
            <TouchableOpacity
              onPress={() => toggleReaction(item.id, "reaction_sad")}
              className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                activeReaction === "reaction_sad"
                  ? "bg-blue-950/60 border-blue-500/50"
                  : "bg-slate-800/50 border-slate-800"
              }`}
            >
              <Frown
                size={13}
                color={
                  activeReaction === "reaction_sad" ? "#38bdf8" : "#94a3b8"
                }
              />
              <Text
                className={`text-xs font-semibold ${
                  activeReaction === "reaction_sad"
                    ? "text-sky-400"
                    : "text-slate-400"
                }`}
              >
                {item.reaction_sad}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="px-4 pt-2 pb-3 border-b border-slate-900 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <TouchableOpacity
            onPress={() => router.replace("/")}
            className="size-8 rounded-full bg-slate-900 border border-slate-800 items-center justify-center"
          >
            <ArrowLeft size={16} color="#94a3b8" />
          </TouchableOpacity>
          <View>
            <Text className="text-lg font-bold tracking-tight text-white">
              Mea Culpa
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/campus-select?mode=change")}
              className="flex-row items-center gap-1"
            >
              <MapPin size={10} color="#38bdf8" />
              <Text className="text-xs font-medium text-sky-400">
                {myCampus ? myCampus : "Select Campus"}
              </Text>
              <Text className="text-[10px] text-slate-500">• Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => toggleShowAllCampuses(!showAllCampuses)}
          className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${
            showAllCampuses
              ? "bg-indigo-950/70 border-indigo-500/50"
              : "bg-slate-900 border-slate-800"
          }`}
        >
          <Compass size={13} color={showAllCampuses ? "#818cf8" : "#94a3b8"} />
          <Text
            className={`text-xs font-semibold ${
              showAllCampuses ? "text-indigo-300" : "text-slate-400"
            }`}
          >
            {showAllCampuses ? "All Campuses" : "My Campus"}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="py-2.5 px-4">
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item.id)}
                className={`px-3 py-1.5 rounded-full border ${
                  isSelected
                    ? "bg-slate-100 border-white"
                    : "bg-slate-900/90 border-slate-800"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isSelected ? "text-slate-950" : item.color
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading && posts.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text className="mt-3 text-sm text-slate-400">
            Loading confessions...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 6,
            paddingBottom: 100,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#38bdf8"
            />
          }
          onEndReached={() => {
            if (hasMore && !loadingMore) {
              loadMorePosts();
            }
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#38bdf8" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="py-20 items-center justify-center px-8 text-center">
              <View className="size-16 rounded-full bg-slate-900 border border-slate-800 items-center justify-center mb-4">
                <Sparkles size={28} color="#64748b" />
              </View>
              <Text className="text-base font-bold text-slate-200 text-center">
                No confessions yet
              </Text>
              <Text className="text-xs text-slate-400 text-center mt-1 max-w-xs leading-relaxed">
                Be the first to speak your truth anonymously on this campus.
              </Text>
            </View>
          }
        />
      )}

      <View className="absolute bottom-7 right-5">
        <TouchableOpacity
          onPress={() => setComposerOpen(true)}
          activeOpacity={0.85}
          className="flex-row items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 bg-indigo-600 px-5 py-3.5 rounded-full shadow-lg shadow-indigo-500/30"
        >
          <Plus size={18} color="#ffffff" strokeWidth={2.5} />
          <Text className="text-sm font-bold text-white tracking-wide">
            Confess
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={composerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setComposerOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-slate-900 rounded-t-3xl border-t border-slate-800 p-5 pb-8">
            {/* Header */}
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-800">
              <View>
                <Text className="text-base font-bold text-white">
                  Post Anonymous Confession
                </Text>
                <Text className="text-xs text-slate-400">
                  Posting to {myCampus || "General"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setComposerOpen(false)}
                className="size-8 rounded-full bg-slate-800 items-center justify-center"
              >
                <X size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center gap-2 my-3">
              {(
                ["confession", "rant", "funny", "advice"] as PostCategory[]
              ).map((cat) => {
                const isSelected = newCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setNewCategory(cat)}
                    className={`flex-1 py-2 rounded-xl border items-center ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-400"
                        : "bg-slate-800 border-slate-700"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold capitalize ${
                        isSelected ? "text-white" : "text-slate-300"
                      }`}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              value={newContent}
              onChangeText={setNewContent}
              maxLength={200}
              multiline
              numberOfLines={4}
              placeholder="What's on your mind? Spill the tea..."
              placeholderTextColor="#64748b"
              className="bg-slate-950 rounded-2xl p-4 text-slate-100 text-base min-h-[110px] border border-slate-800"
              textAlignVertical="top"
            />

            <View className="flex-row items-center justify-between mt-3">
              <Text className="text-xs text-slate-500 font-mono">
                {newContent.length}/200
              </Text>
              <TouchableOpacity
                onPress={handleCreatePost}
                disabled={submitting || !newContent.trim()}
                className={`flex-row items-center gap-2 px-5 py-2.5 rounded-full ${
                  newContent.trim() && !submitting
                    ? "bg-indigo-600"
                    : "bg-slate-800 opacity-60"
                }`}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Send size={14} color="#ffffff" />
                    <Text className="text-xs font-bold text-white uppercase tracking-wider">
                      Publish
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
