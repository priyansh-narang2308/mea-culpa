import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Post, PostCategory, ReactionType } from "../types/post";

const REACTIONS_KEY = "user_reactions_v1";
const REPORTED_KEY = "user_reported_v1";
const REPORT_HIDE_THRESHOLD = 3;
const PAGE_SIZE = 20;

interface PostsState {
  posts: Post[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  userReactions: Record<string, ReactionType>;
  reportedPostIds: string[];
  myCampus: string | null;
  showAllCampuses: boolean;
  setMyCampus: (campus: string) => void;
  toggleShowAllCampuses: (show: boolean) => void;
  loadUserReactions: () => Promise<void>;
  loadReportedPosts: () => Promise<void>;
  toggleReaction: (postId: string, reaction: ReactionType) => Promise<void>;
  setReaction: (postId: string, reaction: ReactionType) => Promise<void>;
  fetchPosts: () => Promise<void>;
  loadMorePosts: () => Promise<void>;
  addPost: (
    content: string,
    category: PostCategory,
  ) => Promise<{ error?: string | null }>;
  reportPost: (postId: string) => Promise<{ error?: string | null }>;
  upsertPost: (post: Post) => void;
  subscribeToRealtime: () => () => void;
}

export const usePostsStore = create<PostsState>()((set, get) => {
  const isHidden = (p: Post) => {
    return (
      p.report_count >= REPORT_HIDE_THRESHOLD ||
      get().reportedPostIds.includes(p.id)
    );
  };

  return {
    posts: [],
    loading: false,
    loadingMore: false,
    hasMore: false,
    userReactions: {},
    reportedPostIds: [],
    myCampus: null,
    showAllCampuses: false,

    setMyCampus: (campus: string) => set({ myCampus: campus }),
    toggleShowAllCampuses: () =>
      set({ showAllCampuses: !get().showAllCampuses }),

    loadUserReactions: async () => {
      const raw = await AsyncStorage.getItem(REACTIONS_KEY);
      if (!raw) return;
      try {
        set({ userReactions: JSON.parse(raw) });
      } catch (error) {
        console.error("Failed to parse reactions", error);
      }
    },

    loadReportedPosts: async () => {
      const raw = await AsyncStorage.getItem(REPORTED_KEY);
      if (raw) {
        set({ reportedPostIds: JSON.parse(raw) });
      }
    },

    fetchPosts: async () => {
      set({ loading: true, hasMore: true });
      const { myCampus, showAllCampuses } = get();

      let query = supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (myCampus && !showAllCampuses) {
        query = query.eq("campus", myCampus).limit(PAGE_SIZE);
      } else {
        query = query.limit(PAGE_SIZE);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching posts:", error);
      }

      if (!error && data) {
        const visible = (data as Post[]).filter((p) => !isHidden(p));
        set({ posts: visible, hasMore: data.length === PAGE_SIZE });
      }

      set({ loading: false });
    },

    loadMorePosts: async () => {
      const { posts, hasMore, loadingMore, myCampus, showAllCampuses } = get();
      if (!hasMore || loadingMore || posts.length === 0) return;

      set({ loadingMore: true });
      const cursor = posts[posts.length - 1].created_at;

      let query = supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .lt("created_at", cursor);

      if (myCampus && !showAllCampuses) {
        query = query.eq("campus", myCampus).limit(PAGE_SIZE);
      } else {
        query = query.limit(PAGE_SIZE);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error loading more posts:", error);
      }

      if (!error && data) {
        const visible = (data as Post[]).filter((p) => !isHidden(p));
        set({
          posts: [...posts, ...visible],
          hasMore: data.length === PAGE_SIZE,
        });
      }

      set({ loadingMore: false });
    },

    toggleReaction: async (postId: string, reaction: ReactionType) => {
      const post = get().posts.find((p) => p.id === postId);
      if (!post) return;

      const existingReaction = get().userReactions[postId];
      const newUserReactions = { ...get().userReactions };
      const updates: Partial<Record<ReactionType, number>> = {};

      if (existingReaction === reaction) {
        updates[reaction] = Math.max(post[reaction] - 1, 0);
        delete newUserReactions[postId];
      } else if (existingReaction) {
        updates[existingReaction] = Math.max(post[existingReaction] - 1, 0);
        updates[reaction] = post[reaction] + 1;
        newUserReactions[postId] = reaction;
      } else {
        updates[reaction] = post[reaction] + 1;
        newUserReactions[postId] = reaction;
      }

      set({
        posts: get().posts.map((p) =>
          p.id === postId ? { ...p, ...updates } : p,
        ),
        userReactions: newUserReactions,
      });

      await AsyncStorage.setItem(
        REACTIONS_KEY,
        JSON.stringify(newUserReactions),
      );

      await supabase.from("posts").update(updates).eq("id", postId);
    },

    setReaction: async (postId: string, reaction: ReactionType) => {
      return get().toggleReaction(postId, reaction);
    },

    addPost: async (content: string, category: PostCategory) => {
      const trimmed = content.trim();
      if (trimmed.length === 0) {
        return { error: "Post cannot be empty" };
      }
      if (trimmed.length > 200) {
        return { error: "Post cannot be longer than 200 characters" };
      }
      const { myCampus } = get();
      const { data, error } = await supabase
        .from("posts")
        .insert({
          content: trimmed,
          campus: myCampus ?? "general",
          category: category,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding post:", error);
        return { error: error.message };
      }

      if (data) {
        get().upsertPost(data as Post);
      }
      return { error: null };
    },

    reportPost: async (postId: string) => {
      const { reportedPostIds } = get();
      if (reportedPostIds.includes(postId)) {
        return { error: "You have already reported this post" };
      }

      const post = get().posts.find((p) => p.id === postId);
      if (!post) return { error: "Post not found" };

      const newCount = (post.report_count ?? 0) + 1;
      const newReportedIds = [...reportedPostIds, postId];

      set({
        reportedPostIds: newReportedIds,
        posts:
          newCount >= REPORT_HIDE_THRESHOLD
            ? get().posts.filter((p) => p.id !== postId)
            : get().posts.map((p) =>
                p.id === postId ? { ...p, report_count: newCount } : p,
              ),
      });

      await AsyncStorage.setItem(REPORTED_KEY, JSON.stringify(newReportedIds));

      const { error } = await supabase
        .from("posts")
        .update({ report_count: newCount })
        .eq("id", postId);

      if (error) {
        return { error: error.message };
      }
      return { error: null };
    },

    upsertPost: (post: Post) => {
      const { myCampus, showAllCampuses } = get();
      if (myCampus && !showAllCampuses && post.campus !== myCampus) {
        return;
      }

      if (isHidden(post)) {
        set({ posts: get().posts.filter((p) => p.id !== post.id) });
        return;
      }

      const exists = get().posts.some((p) => p.id === post.id);
      if (exists) {
        set({
          posts: get().posts.map((p) => (p.id === post.id ? post : p)),
        });
      } else {
        set({ posts: [post, ...get().posts] });
      }
    },

    subscribeToRealtime: () => {
      const channel = supabase
        .channel("posts-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "posts" },
          (payload) => {
            get().upsertPost(payload.new as Post);
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "posts" },
          (payload) => {
            get().upsertPost(payload.new as Post);
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    },
  };
});
