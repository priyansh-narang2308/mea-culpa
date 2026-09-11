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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Text as RNRText } from "@/components/ui/text";
import { getSelectedCampus } from "@/lib/campus-storage";
import { useAppTheme } from "@/lib/theme-manager";
import { usePostsStore } from "@/stores/usePostsStore";
import { Post, PostCategory } from "@/types/post";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import {
  ArrowLeft,
  Compass,
  Flag,
  Flame,
  Frown,
  Heart,
  HeartCrack,
  MapPin,
  Moon,
  MoreVertical,
  Plus,
  Smile,
  Sun,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
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
  const [refreshing, setRefreshing] = useState(false);
  const [reportTargetPost, setReportTargetPost] = useState<Post | null>(null);
  const [alreadyReportedPost, setAlreadyReportedPost] = useState<Post | null>(
    null,
  );

  const {
    posts,
    loading,
    loadingMore,
    hasMore,
    myCampus,
    showAllCampuses,
    userReactions,
    reportedPostIds,
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

  const filteredPosts = posts.filter((p) => {
    if (selectedCategory === "all") return true;
    return p.category === selectedCategory;
  });

  const renderPost = ({ item }: { item: Post }) => {
    const activeReaction = userReactions[item.id];
    const alreadyReported = reportedPostIds.includes(item.id);

    const handleReact = (
      type:
        | "reaction_heart"
        | "reaction_shock"
        | "reaction_laugh"
        | "reaction_sad",
    ) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toggleReaction(item.id, type);
    };

    const handleReport = () => {
      if (alreadyReported) {
        setAlreadyReportedPost(item);
        return;
      }
      setReportTargetPost(item);
    };

    return (
      <View
        className={`mb-4 overflow-hidden rounded-[20px] border p-4 shadow-sm ${
          isDark ? "bg-zinc-900/90 border-zinc-800" : "bg-white border-zinc-200"
        }`}
      >
        <View className="flex-row items-center justify-between mb-2.5">
          <View className="flex-row items-center gap-2 flex-1 mr-2">
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

            {item.campus && (
              <View
                className={`flex-row items-center gap-1 rounded-full px-2 py-0.5 shrink ${
                  isDark ? "bg-zinc-800" : "bg-zinc-100"
                }`}
              >
                <MapPin size={10} color={isDark ? "#a1a1aa" : "#71717a"} />
                <Text
                  numberOfLines={1}
                  className={`text-[10px] font-medium shrink ${
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
              className={`text-xs font-bold ${
                isDark ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              {formatRelativeTime(item.created_at)}
            </Text>
            <TouchableOpacity
              onPress={handleReport}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Flag
                size={14}
                color={
                  alreadyReported ? "#ef4444" : isDark ? "#71717a" : "#a1a1aa"
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text
          className={`text-[15px] leading-relaxed font-normal select-text ${
            isDark ? "text-zinc-100" : "text-zinc-900"
          }`}
        >
          {item.content}
        </Text>

        <View
          className={`mt-3.5 pt-3 border-t flex-row items-center justify-between ${
            isDark ? "border-zinc-800/80" : "border-zinc-100"
          }`}
        >
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => handleReact("reaction_heart")}
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

            <TouchableOpacity
              onPress={() => handleReact("reaction_shock")}
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

            <TouchableOpacity
              onPress={() => handleReact("reaction_laugh")}
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

            <TouchableOpacity
              onPress={() => handleReact("reaction_sad")}
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

      <View
        className={`px-4 py-3 border-b flex-row items-center justify-between ${
          isDark ? "bg-black border-zinc-900" : "bg-white border-zinc-200"
        }`}
      >
        <View className="flex-row items-center gap-3">
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
          <Text
            className={`text-xl font-bold tracking-tight ${
              isDark ? "text-white" : "text-zinc-950"
            }`}
          >
            Mea Culpa
          </Text>
        </View>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TouchableOpacity
              className={`size-9 rounded-full items-center justify-center border ${
                isDark
                  ? "bg-zinc-900 border-zinc-800"
                  : "bg-zinc-100 border-zinc-200"
              }`}
            >
              <MoreVertical size={18} color={isDark ? "#d4d4d8" : "#3f3f46"} />
            </TouchableOpacity>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={`w-56 mt-2 ${
              isDark
                ? "bg-zinc-900 border-zinc-800"
                : "bg-white border-zinc-200"
            }`}
            align="end"
          >
            <DropdownMenuLabel
              className={`font-semibold ${isDark ? "text-zinc-300" : "text-zinc-800"}`}
            >
              {myCampus ? `Campus: ${myCampus}` : "No Campus Selected"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator
              className={isDark ? "bg-zinc-800" : "bg-zinc-100"}
            />

            <DropdownMenuItem
              onPress={() => router.push("/campus-select?mode=change")}
            >
              <MapPin
                size={16}
                color={isDark ? "#fb7185" : "#e11d48"}
                className="mr-2"
              />
              <Text
                className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}
              >
                Change Campus
              </Text>
            </DropdownMenuItem>

            <DropdownMenuItem
              onPress={() => toggleShowAllCampuses(!showAllCampuses)}
            >
              <Compass
                size={16}
                color={isDark ? "#fb7185" : "#e11d48"}
                className="mr-2"
              />
              <Text
                className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}
              >
                {showAllCampuses ? "View My Campus Only" : "View All Campuses"}
              </Text>
            </DropdownMenuItem>

            <DropdownMenuSeparator
              className={isDark ? "bg-zinc-800" : "bg-zinc-100"}
            />

            <DropdownMenuItem onPress={toggleTheme}>
              {isDark ? (
                <Sun size={16} color="#fb7185" className="mr-2" />
              ) : (
                <Moon size={16} color="#e11d48" className="mr-2" />
              )}
              <Text
                className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}
              >
                {isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
              </Text>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                <HeartCrack size={26} color="#f43f5e" />
              </View>
              <Text
                className={`text-base font-bold text-center ${
                  isDark ? "text-zinc-200" : "text-zinc-900"
                }`}
              >
                {selectedCategory === "all"
                  ? "No posts yet"
                  : selectedCategory === "confession"
                    ? "No confessions yet"
                    : selectedCategory === "rant"
                      ? "No rants yet"
                      : selectedCategory === "funny"
                        ? "No funny posts yet"
                        : "No advice posts yet"}
              </Text>
              <Text
                className={`text-xs text-center mt-1 max-w-xs leading-relaxed ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                {selectedCategory === "rant"
                  ? "Be the first to vent and let it all out anonymously."
                  : selectedCategory === "funny"
                    ? "Be the first to share a laugh with your campus."
                    : selectedCategory === "advice"
                      ? "Be the first to ask for some anonymous wisdom."
                      : "Be the first to speak your truth anonymously on this campus."}
              </Text>
            </View>
          }
        />
      )}

      <View className="absolute bottom-7 right-5">
        <TouchableOpacity
          onPress={() => setComposerOpen(true)}
          activeOpacity={0.88}
          className="flex-row items-center gap-2 bg-rose-600 px-5 py-3.5 rounded-full shadow-lg shadow-rose-500/40"
        >
          <Plus size={18} color="#ffffff" strokeWidth={2.5} />
          {/* <Text className="text-sm font-bold text-white tracking-wide">
            Confess
          </Text> */}
        </TouchableOpacity>
      </View>

      <ComposerModal
        visible={composerOpen}
        onClose={() => setComposerOpen(false)}
      />

      <AlertDialog
        open={!!reportTargetPost}
        onOpenChange={(open) => {
          if (!open) setReportTargetPost(null);
        }}
      >
        <AlertDialogContent className="w-[90%] max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Report Confession?</AlertDialogTitle>
            <AlertDialogDescription>
              This will flag the post for review. You can only report a post
              once.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <RNRText>Cancel</RNRText>
            </AlertDialogCancel>
            <AlertDialogAction
              onPress={async () => {
                if (reportTargetPost) {
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Warning,
                  );
                  await reportPost(reportTargetPost.id);
                  setReportTargetPost(null);
                }
              }}
              style={{ backgroundColor: "#ef4444" }}
              className="active:opacity-80"
            >
              <RNRText className="text-white">Report</RNRText>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={!!alreadyReportedPost}
        onOpenChange={(open) => {
          if (!open) setAlreadyReportedPost(null);
        }}
      >
        <AlertDialogContent className="w-[90%] max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Already Reported</AlertDialogTitle>
            <AlertDialogDescription>
              You have already flagged this post for review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onPress={() => setAlreadyReportedPost(null)}
              className={isDark ? "bg-white" : "bg-black"}
            >
              <RNRText className={isDark ? "text-black" : "text-white"}>
                OK
              </RNRText>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
}

function ComposerModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { isDark } = useAppTheme();
  const { myCampus, addPost } = usePostsStore();
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<PostCategory>("confession");
  const [submitting, setSubmitting] = useState(false);

  const handleCreatePost = async () => {
    if (!newContent.trim()) {
      Alert.alert(
        "Empty Confession",
        "Please enter your confession before publishing.",
      );
      return;
    }
    setSubmitting(true);
    const res = await addPost(newContent.trim(), newCategory);
    setSubmitting(false);

    if (res && !res.error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setNewContent("");
      onClose();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <BlurView
        intensity={isDark ? 30 : 15}
        tint={isDark ? "dark" : "light"}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <Pressable className="flex-1 justify-end" onPress={onClose}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className={`rounded-t-3xl border-t p-5 pb-8 ${
              isDark
                ? "bg-zinc-900 border-zinc-800"
                : "bg-white border-zinc-200"
            }`}
            style={{
              shadowColor: isDark ? "#000" : "#71717a",
              shadowOffset: { width: 0, height: -10 },
              shadowOpacity: isDark ? 0.5 : 0.1,
              shadowRadius: 20,
              elevation: 24,
            }}
          >
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
                onPress={onClose}
                className={`size-8 rounded-full items-center justify-center ${
                  isDark ? "bg-zinc-800" : "bg-zinc-100"
                }`}
              >
                <X size={16} color={isDark ? "#a1a1aa" : "#71717a"} />
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

            <TextInput
              value={newContent}
              onChangeText={setNewContent}
              maxLength={200}
              multiline
              numberOfLines={4}
              disableFullscreenUI={true}
              placeholder="What's on your mind? Spill the tea anonymously..."
              placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
              className={`rounded-2xl p-4 text-base min-h-[110px] border ${
                isDark
                  ? "bg-black text-zinc-100 border-zinc-800"
                  : "bg-zinc-50 text-zinc-900 border-zinc-200"
              }`}
              textAlignVertical="top"
            />

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
                    ? "bg-rose-600"
                    : isDark
                      ? "bg-zinc-800"
                      : "bg-zinc-200"
                }`}
                style={
                  newContent.trim() && !submitting
                    ? {
                        shadowColor: "#f43f5e",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                        elevation: 4,
                      }
                    : {
                        opacity: 0.6,
                      }
                }
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Text className="text-xs font-bold text-white uppercase tracking-wider">
                      Publish
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
