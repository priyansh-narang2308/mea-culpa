import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Text as RNRText } from "@/components/ui/text";
import { getSelectedCampus } from "@/lib/campus-storage";
import { useAppTheme } from "@/lib/theme-manager";
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
  Moon,
  Plus,
  Send,
  Smile,
  Sparkles,
  Sun,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES: { id: PostCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "confession", label: "Confession" },
  { id: "rant", label: "Rant" },
  { id: "funny", label: "Funny" },
  { id: "advice", label: "Advice" },
];

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
  const { isDark, toggleTheme } = useAppTheme();
  const [selectedCategory, setSelectedCategory] = useState<
    PostCategory | "all"
  >("all");
  const [composerOpen, setComposerOpen] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<PostCategory>("confession");
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // AlertDialog states
  const [reportTargetPost, setReportTargetPost] = useState<Post | null>(null);
  const [alertInfo, setAlertInfo] = useState<{
    title: string;
    message: string;
  } | null>(null);

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
      setAlertInfo({
        title: "Empty Confession",
        message: "Please enter your confession before publishing.",
      });
      return;
    }
    setSubmitting(true);
    const res = await addPost(newContent, newCategory);
    setSubmitting(false);

    if (res.error) {
      setAlertInfo({
        title: "Post Failed",
        message: res.error,
      });
    } else {
      setNewContent("");
      setComposerOpen(false);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (selectedCategory === "all") return true;
    return p.category === selectedCategory;
  });

  const renderPost = ({ item }: { item: Post }) => {
    const activeReaction = userReactions[item.id];

    return (
      <View
        className={`mb-3.5 rounded-2xl border p-4 shadow-sm ${
          isDark ? "bg-zinc-900/90 border-zinc-800" : "bg-white border-zinc-200"
        }`}
      >
        {/* Card Top: Category, Campus, Timestamp, Report */}
        <View className="flex-row items-center justify-between mb-2.5">
          <View className="flex-row items-center gap-2">
            <View
              className={`rounded-full px-2.5 py-0.5 border ${
                isDark
                  ? "bg-rose-950/40 border-rose-900/50"
                  : "bg-rose-50 border-rose-200"
              }`}
            >
              <Text
                className={`text-[11px] font-semibold uppercase tracking-wider ${
                  isDark ? "text-rose-300" : "text-rose-600"
                }`}
              >
                {item.category}
              </Text>
            </View>

            {showAllCampuses && item.campus && (
              <View
                className={`flex-row items-center gap-1 rounded-full px-2 py-0.5 ${
                  isDark ? "bg-zinc-800" : "bg-zinc-100"
                }`}
              >
                <MapPin size={10} color={isDark ? "#a1a1aa" : "#71717a"} />
                <Text
                  className={`text-[10px] font-medium ${
                    isDark ? "text-zinc-300" : "text-zinc-700"
                  }`}
                >
                  {item.campus}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center gap-2">
            <Text
              className={`text-[11px] font-mono ${
                isDark ? "text-zinc-500" : "text-zinc-400"
              }`}
            >
              {formatRelativeTime(item.created_at)}
            </Text>
            <TouchableOpacity
              onPress={() => setReportTargetPost(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Flag size={12} color={isDark ? "#71717a" : "#a1a1aa"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confession Content */}
        <Text
          className={`text-[15px] leading-relaxed font-normal select-text ${
            isDark ? "text-zinc-100" : "text-zinc-900"
          }`}
        >
          {item.content}
        </Text>

        {/* Reaction Bar */}
        <View
          className={`mt-3.5 pt-3 border-t flex-row items-center justify-between ${
            isDark ? "border-zinc-800/80" : "border-zinc-100"
          }`}
        >
          <View className="flex-row items-center gap-2">
            {/* Heart */}
            <TouchableOpacity
              onPress={() => toggleReaction(item.id, "reaction_heart")}
              className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
                activeReaction === "reaction_heart"
                  ? isDark
                    ? "bg-rose-950/60 border-rose-500/50"
                    : "bg-rose-100 border-rose-300"
                  : isDark
                    ? "bg-zinc-800/60 border-zinc-800"
                    : "bg-zinc-50 border-zinc-200"
              }`}
            >
              <Heart
                size={13}
                color={
                  activeReaction === "reaction_heart"
                    ? "#f43f5e"
                    : isDark
                      ? "#71717a"
                      : "#a1a1aa"
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
                    ? "text-rose-500"
                    : isDark
                      ? "text-zinc-400"
                      : "text-zinc-600"
                }`}
              >
                {item.reaction_heart}
              </Text>
            </TouchableOpacity>

            {/* Shock / Flame */}
            <TouchableOpacity
              onPress={() => toggleReaction(item.id, "reaction_shock")}
              className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                activeReaction === "reaction_shock"
                  ? isDark
                    ? "bg-rose-950/60 border-rose-500/50"
                    : "bg-pink-100 border-pink-300"
                  : isDark
                    ? "bg-zinc-800/60 border-zinc-800"
                    : "bg-zinc-50 border-zinc-200"
              }`}
            >
              <Flame
                size={13}
                color={
                  activeReaction === "reaction_shock"
                    ? "#ec4899"
                    : isDark
                      ? "#71717a"
                      : "#a1a1aa"
                }
              />
              <Text
                className={`text-xs font-semibold ${
                  activeReaction === "reaction_shock"
                    ? "text-pink-500"
                    : isDark
                      ? "text-zinc-400"
                      : "text-zinc-600"
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
                  ? isDark
                    ? "bg-amber-950/60 border-amber-500/50"
                    : "bg-amber-100 border-amber-300"
                  : isDark
                    ? "bg-zinc-800/60 border-zinc-800"
                    : "bg-zinc-50 border-zinc-200"
              }`}
            >
              <Smile
                size={13}
                color={
                  activeReaction === "reaction_laugh"
                    ? "#f59e0b"
                    : isDark
                      ? "#71717a"
                      : "#a1a1aa"
                }
              />
              <Text
                className={`text-xs font-semibold ${
                  activeReaction === "reaction_laugh"
                    ? "text-amber-500"
                    : isDark
                      ? "text-zinc-400"
                      : "text-zinc-600"
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
                  ? isDark
                    ? "bg-sky-950/60 border-sky-500/50"
                    : "bg-sky-100 border-sky-300"
                  : isDark
                    ? "bg-zinc-800/60 border-zinc-800"
                    : "bg-zinc-50 border-zinc-200"
              }`}
            >
              <Frown
                size={13}
                color={
                  activeReaction === "reaction_sad"
                    ? "#38bdf8"
                    : isDark
                      ? "#71717a"
                      : "#a1a1aa"
                }
              />
              <Text
                className={`text-xs font-semibold ${
                  activeReaction === "reaction_sad"
                    ? "text-sky-500"
                    : isDark
                      ? "text-zinc-400"
                      : "text-zinc-600"
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
    <SafeAreaView className={`flex-1 ${isDark ? "bg-black" : "bg-zinc-50"}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#000000" : "#ffffff"}
      />

      {/* Top Header */}
      <View
        className={`px-4 pt-2 pb-3 border-b flex-row items-center justify-between ${
          isDark ? "bg-black border-zinc-900" : "bg-white border-zinc-200"
        }`}
      >
        <View className="flex-row items-center gap-2.5">
          <TouchableOpacity
            onPress={() => router.replace("/")}
            className={`size-8 rounded-full items-center justify-center border ${
              isDark
                ? "bg-zinc-900 border-zinc-800"
                : "bg-zinc-100 border-zinc-200"
            }`}
          >
            <ArrowLeft size={16} color={isDark ? "#d4d4d8" : "#3f3f46"} />
          </TouchableOpacity>
          <View>
            <Text
              className={`text-base font-bold tracking-tight ${
                isDark ? "text-white" : "text-zinc-950"
              }`}
            >
              Mea Culpa
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/campus-select?mode=change")}
              className="flex-row items-center gap-1"
            >
              <MapPin size={10} color="#f43f5e" />
              <Text className="text-xs font-medium text-rose-500">
                {myCampus ? myCampus : "Select Campus"}
              </Text>
              <Text
                className={`text-[10px] ${
                  isDark ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                • Change
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          {/* Scope Toggle */}
          <TouchableOpacity
            onPress={() => toggleShowAllCampuses(!showAllCampuses)}
            className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${
              showAllCampuses
                ? isDark
                  ? "bg-rose-950/60 border-rose-500/50"
                  : "bg-rose-50 border-rose-300"
                : isDark
                  ? "bg-zinc-900 border-zinc-800"
                  : "bg-zinc-100 border-zinc-200"
            }`}
          >
            <Compass
              size={13}
              color={
                showAllCampuses ? "#f43f5e" : isDark ? "#71717a" : "#71717a"
              }
            />
            <Text
              className={`text-xs font-semibold ${
                showAllCampuses
                  ? "text-rose-500 font-bold"
                  : isDark
                    ? "text-zinc-400"
                    : "text-zinc-600"
              }`}
            >
              {showAllCampuses ? "All Campuses" : "My Campus"}
            </Text>
          </TouchableOpacity>

          {/* Theme Switcher Button */}
          <TouchableOpacity
            onPress={toggleTheme}
            className={`size-8 rounded-full items-center justify-center border ${
              isDark
                ? "bg-zinc-900 border-zinc-800"
                : "bg-rose-50 border-rose-200"
            }`}
          >
            {isDark ? (
              <Sun size={15} color="#fb7185" />
            ) : (
              <Moon size={15} color="#e11d48" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Pills */}
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
                className={`px-3 py-1.5 rounded-full border transition-all ${
                  isSelected
                    ? "bg-rose-600 border-rose-600"
                    : isDark
                      ? "bg-zinc-900/90 border-zinc-800"
                      : "bg-white border-zinc-200"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isSelected
                      ? "text-white"
                      : isDark
                        ? "text-zinc-400"
                        : "text-zinc-600"
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Main Feed Content */}
      {loading && posts.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f43f5e" />
          <Text
            className={`mt-3 text-sm ${
              isDark ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
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
              tintColor="#f43f5e"
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
                <ActivityIndicator size="small" color="#f43f5e" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="py-20 items-center justify-center px-8 text-center">
              <View
                className={`size-16 rounded-full items-center justify-center mb-4 border ${
                  isDark
                    ? "bg-zinc-900 border-zinc-800"
                    : "bg-rose-50 border-rose-200"
                }`}
              >
                <Sparkles size={26} color="#f43f5e" />
              </View>
              <Text
                className={`text-base font-bold text-center ${
                  isDark ? "text-zinc-200" : "text-zinc-900"
                }`}
              >
                No confessions yet
              </Text>
              <Text
                className={`text-xs text-center mt-1 max-w-xs leading-relaxed ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Be the first to speak your truth anonymously on this campus.
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Confess Button */}
      <View className="absolute bottom-7 right-5">
        <TouchableOpacity
          onPress={() => setComposerOpen(true)}
          activeOpacity={0.88}
          className="flex-row items-center gap-2 bg-rose-600 px-5 py-3.5 rounded-full shadow-lg shadow-rose-500/40"
        >
          <Plus size={18} color="#ffffff" strokeWidth={2.5} />
          <Text className="text-sm font-bold text-white tracking-wide">
            Confess
          </Text>
        </TouchableOpacity>
      </View>

      {/* Composer Modal */}
      <Modal
        visible={composerOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setComposerOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View
            className={`rounded-t-3xl border-t p-5 pb-8 ${
              isDark
                ? "bg-zinc-900 border-zinc-800"
                : "bg-white border-zinc-200"
            }`}
          >
            {/* Modal Header */}
            <View
              className={`flex-row items-center justify-between pb-3 border-b ${
                isDark ? "border-zinc-800" : "border-zinc-100"
              }`}
            >
              <View>
                <Text
                  className={`text-base font-bold ${
                    isDark ? "text-white" : "text-zinc-950"
                  }`}
                >
                  Post Anonymous Confession
                </Text>
                <Text
                  className={`text-xs ${
                    isDark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  Posting to {myCampus || "General"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setComposerOpen(false)}
                className={`size-8 rounded-full items-center justify-center ${
                  isDark ? "bg-zinc-800" : "bg-zinc-100"
                }`}
              >
                <X size={16} color={isDark ? "#a1a1aa" : "#71717a"} />
              </TouchableOpacity>
            </View>

            {/* Category Selectors */}
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
                        ? "bg-rose-600 border-rose-500"
                        : isDark
                          ? "bg-zinc-800 border-zinc-700"
                          : "bg-zinc-100 border-zinc-200"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold capitalize ${
                        isSelected
                          ? "text-white"
                          : isDark
                            ? "text-zinc-300"
                            : "text-zinc-700"
                      }`}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Confession Text Input */}
            <TextInput
              value={newContent}
              onChangeText={setNewContent}
              maxLength={200}
              multiline
              numberOfLines={4}
              placeholder="What's on your mind? Spill the tea anonymously..."
              placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
              className={`rounded-2xl p-4 text-base min-h-[110px] border ${
                isDark
                  ? "bg-black text-zinc-100 border-zinc-800"
                  : "bg-zinc-50 text-zinc-900 border-zinc-200"
              }`}
              textAlignVertical="top"
            />

            {/* Action Bar */}
            <View className="flex-row items-center justify-between mt-3">
              <Text
                className={`text-xs font-mono ${
                  isDark ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                {newContent.length}/200
              </Text>
              <TouchableOpacity
                onPress={handleCreatePost}
                disabled={submitting || !newContent.trim()}
                className={`flex-row items-center gap-2 px-5 py-2.5 rounded-full ${
                  newContent.trim() && !submitting
                    ? "bg-rose-600 shadow-md shadow-rose-500/30"
                    : isDark
                      ? "bg-zinc-800 opacity-60"
                      : "bg-zinc-200 opacity-60"
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

      {/* Shadcn / RNR Alert Dialog for Reporting Confession */}
      <AlertDialog
        open={!!reportTargetPost}
        onOpenChange={(open) => {
          if (!open) setReportTargetPost(null);
        }}
      >
        <AlertDialogContent
          className={
            isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
          }
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              className={isDark ? "text-white" : "text-zinc-950"}
            >
              Report Confession
            </AlertDialogTitle>
            <AlertDialogDescription
              className={isDark ? "text-zinc-400" : "text-zinc-600"}
            >
              Are you sure you want to report this confession? It will be
              reviewed and hidden from the feed if multiple users flag it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onPress={() => setReportTargetPost(null)}
              className={
                isDark
                  ? "bg-zinc-800 border-zinc-700"
                  : "bg-zinc-100 border-zinc-200"
              }
            >
              <RNRText className={isDark ? "text-zinc-200" : "text-zinc-700"}>
                Cancel
              </RNRText>
            </AlertDialogCancel>
            <AlertDialogAction
              onPress={async () => {
                if (reportTargetPost) {
                  await reportPost(reportTargetPost.id);
                  setReportTargetPost(null);
                }
              }}
              className="bg-rose-600 active:bg-rose-700"
            >
              <RNRText className="text-white font-semibold">Report</RNRText>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Shadcn / RNR Alert Dialog for Feedback & Alerts */}
      <AlertDialog
        open={!!alertInfo}
        onOpenChange={(open) => {
          if (!open) setAlertInfo(null);
        }}
      >
        <AlertDialogContent
          className={
            isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
          }
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              className={isDark ? "text-white" : "text-zinc-950"}
            >
              {alertInfo?.title}
            </AlertDialogTitle>
            <AlertDialogDescription
              className={isDark ? "text-zinc-400" : "text-zinc-600"}
            >
              {alertInfo?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onPress={() => setAlertInfo(null)}
              className="bg-rose-600 active:bg-rose-700"
            >
              <RNRText className="text-white font-semibold">Got it</RNRText>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
}
