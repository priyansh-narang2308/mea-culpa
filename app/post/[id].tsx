import { useAppTheme } from "@/lib/theme-manager";
import { usePostsStore } from "@/stores/usePostsStore";
import { useRepliesStore } from "@/stores/useRepliesStore";
import { PostCategory } from "@/types/post";
import { Reply } from "@/types/reply";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Flame,
  Frown,
  Heart,
  MapPin,
  Send,
  Smile,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EMPTY_REPLIES: Reply[] = [];

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

function getCategoryColor(category: PostCategory, isDark: boolean) {
  switch (category) {
    case "confession":
      return {
        bg: isDark ? "bg-rose-950/40" : "bg-rose-50",
        border: isDark ? "border-rose-900/50" : "border-rose-200",
        text: isDark ? "text-rose-300" : "text-rose-600",
      };
    case "rant":
      return {
        bg: isDark ? "bg-orange-950/40" : "bg-orange-50",
        border: isDark ? "border-orange-900/50" : "border-orange-200",
        text: isDark ? "text-orange-300" : "text-orange-600",
      };
    case "funny":
      return {
        bg: isDark ? "bg-amber-950/40" : "bg-amber-50",
        border: isDark ? "border-amber-900/50" : "border-amber-200",
        text: isDark ? "text-amber-300" : "text-amber-600",
      };
    case "advice":
      return {
        bg: isDark ? "bg-sky-950/40" : "bg-sky-50",
        border: isDark ? "border-sky-900/50" : "border-sky-200",
        text: isDark ? "text-sky-300" : "text-sky-600",
      };
    default:
      return {
        bg: isDark ? "bg-zinc-800" : "bg-zinc-100",
        border: isDark ? "border-zinc-700" : "border-zinc-200",
        text: isDark ? "text-zinc-300" : "text-zinc-600",
      };
  }
}

const PostDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useAppTheme();

  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const post = usePostsStore((s) => s.posts.find((p) => p.id === id));
  const { userReactions, toggleReaction } = usePostsStore();

  const { fetchReplies, subscribeToReplies, repliesByPost, addReply, loading } =
    useRepliesStore();
  const replies = repliesByPost[id] || EMPTY_REPLIES;

  useEffect(() => {
    fetchReplies(id);
    const unsubscribe = subscribeToReplies(id);
    return () => {
      unsubscribe();
    };
  }, [id]);

  if (!post) {
    return (
      <SafeAreaView
        className={`flex-1 justify-center items-center ${isDark ? "bg-black" : "bg-zinc-50"}`}
      >
        <Text className={isDark ? "text-white" : "text-black"}>
          Post not found
        </Text>
      </SafeAreaView>
    );
  }

  const activeReaction = userReactions[post.id];
  const catColor = getCategoryColor(post.category, isDark);

  const handleReact = (
    type:
      | "reaction_heart"
      | "reaction_shock"
      | "reaction_laugh"
      | "reaction_sad",
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleReaction(post.id, type);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const res = await addReply(post.id, replyText);
    if (!res.error) {
      setReplyText("");
    }
    setSubmitting(false);
  };

  const renderReply = ({ item }: { item: Reply }) => (
    <View
      className={`px-4 py-3 border-b ${isDark ? "border-zinc-800/60" : "border-zinc-100"}`}
    >
      <View className="flex-row items-center justify-between mb-1">
        <Text
          className={`text-xs font-bold ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
        >
          Anonymous
        </Text>
        <Text
          className={`text-[10px] font-medium ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
        >
          {formatRelativeTime(item.created_at)}
        </Text>
      </View>
      <Text
        className={`text-[14px] leading-relaxed ${isDark ? "text-zinc-200" : "text-zinc-800"}`}
      >
        {item.content}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      className={isDark ? "bg-black" : "bg-zinc-50"}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View
          className={`px-4 py-3 border-b flex-row items-center ${isDark ? "bg-black border-zinc-900" : "bg-white border-zinc-200"}`}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className={`size-8 rounded-full items-center justify-center border ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-200"}`}
          >
            <ArrowLeft size={16} color={isDark ? "#d4d4d8" : "#3f3f46"} />
          </TouchableOpacity>
          <Text
            className={`flex-1 text-center font-bold text-[16px] mr-8 ${isDark ? "text-white" : "text-black"}`}
          >
            Replies
          </Text>
        </View>

        <FlatList
          ref={flatListRef}
          style={{ flex: 1 }}
          data={replies}
          keyExtractor={(item) => item.id}
          renderItem={renderReply}
          contentContainerStyle={{ paddingBottom: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={
            <View
              className={`mx-4 mt-4 mb-2 overflow-hidden rounded-[20px] border p-4 shadow-sm ${isDark ? "bg-zinc-900/90 border-zinc-800" : "bg-white border-zinc-200"}`}
            >
              <View className="flex-row items-center justify-between mb-2.5">
                <View className="flex-row items-center gap-2 flex-1 mr-2">
                  <View
                    className={`rounded-full px-2.5 py-0.5 border ${catColor.bg} ${catColor.border}`}
                  >
                    <Text
                      className={`text-[11px] font-semibold uppercase tracking-wider ${catColor.text}`}
                    >
                      {post.category}
                    </Text>
                  </View>
                  {post.campus && (
                    <View
                      className={`flex-row items-center gap-1 rounded-full px-2 py-0.5 shrink ${isDark ? "bg-zinc-800" : "bg-zinc-100"}`}
                    >
                      <MapPin
                        size={10}
                        color={isDark ? "#a1a1aa" : "#71717a"}
                      />
                      <Text
                        numberOfLines={1}
                        className={`text-[10px] font-medium shrink ${isDark ? "text-zinc-300" : "text-zinc-700"}`}
                      >
                        {post.campus}
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  className={`text-xs font-bold ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
                >
                  {formatRelativeTime(post.created_at)}
                </Text>
              </View>

              <Text
                className={`text-[15px] leading-relaxed font-normal ${isDark ? "text-zinc-100" : "text-zinc-900"}`}
              >
                {post.content}
              </Text>

              <View
                className={`mt-3.5 pt-3 border-t flex-row items-center justify-between ${isDark ? "border-zinc-800/80" : "border-zinc-100"}`}
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
                      className={`text-xs font-semibold ${activeReaction === "reaction_heart" ? "text-rose-500" : isDark ? "text-zinc-400" : "text-zinc-600"}`}
                    >
                      {post.reaction_heart}
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
                      className={`text-xs font-semibold ${activeReaction === "reaction_shock" ? "text-pink-500" : isDark ? "text-zinc-400" : "text-zinc-600"}`}
                    >
                      {post.reaction_shock}
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
                      className={`text-xs font-semibold ${activeReaction === "reaction_laugh" ? "text-amber-500" : isDark ? "text-zinc-400" : "text-zinc-600"}`}
                    >
                      {post.reaction_laugh}
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
                      className={`text-xs font-semibold ${activeReaction === "reaction_sad" ? "text-sky-500" : isDark ? "text-zinc-400" : "text-zinc-600"}`}
                    >
                      {post.reaction_sad}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            loading ? (
              <View className="py-8 items-center">
                <ActivityIndicator color={isDark ? "#71717a" : "#a1a1aa"} />
              </View>
            ) : (
              <View className="py-12 items-center">
                <Text
                  className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
                >
                  No replies yet. Be the first to spill the tea!
                </Text>
              </View>
            )
          }
        />

        <View
          className={`flex-row items-end px-3 py-2 border-t ${isDark ? "bg-zinc-950 border-zinc-900" : "bg-white border-zinc-200"}`}
        >
          <TextInput
            value={replyText}
            onChangeText={setReplyText}
            placeholder="Reply anonymously..."
            placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
            multiline
            maxLength={500}
            className={`flex-1 min-h-[40px] max-h-[120px] rounded-2xl px-4 py-2.5 mr-2 text-[15px] border ${
              isDark
                ? "bg-zinc-900 text-white border-zinc-800"
                : "bg-zinc-100 text-zinc-900 border-zinc-200"
            }`}
          />
          <TouchableOpacity
            disabled={!replyText.trim() || submitting}
            onPress={handleSendReply}
            className={`size-10 rounded-full items-center justify-center ${
              replyText.trim() && !submitting
                ? "bg-rose-500"
                : isDark
                  ? "bg-zinc-800"
                  : "bg-zinc-200"
            }`}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send
                size={18}
                color={
                  replyText.trim() ? "#fff" : isDark ? "#52525b" : "#a1a1aa"
                }
                style={{ marginLeft: -1, marginTop: 1 }}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PostDetailScreen;
