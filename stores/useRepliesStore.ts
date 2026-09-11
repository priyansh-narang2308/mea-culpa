import { supabase } from "@/lib/supabase";
import { Reply } from "@/types/reply";
import { create } from "zustand";

interface RepliesStore {
  repliesByPost: Record<string, Reply[]>;
  loading: boolean;
  fetchReplies: (postId: string) => Promise<void>;
  addReply: (
    postId: string,
    content: string,
  ) => Promise<{ error: string | null }>;
  subscribeToReplies: (postId: string) => () => void;
}

export const useRepliesStore = create<RepliesStore>((set, get) => ({
  repliesByPost: {},
  loading: false,

  fetchReplies: async (postId: string) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("replies")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      set((state) => ({
        repliesByPost: {
          ...state.repliesByPost,
          [postId]: data as Reply[],
        },
      }));
    } else {
      console.error("Error fetching replies:", error);
    }
    set({ loading: false });
  },

  addReply: async (postId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return { error: "Reply cannot be empty" };

    const { data, error } = await supabase
      .from("replies")
      .insert({
        post_id: postId,
        content: trimmed,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding reply:", error);
      return { error: error.message };
    }

    if (data) {
      set((state) => {
        const existing = state.repliesByPost[postId] || [];
        // Prevent duplicate if realtime already inserted it
        if (existing.some((r) => r.id === data.id)) return state;

        return {
          repliesByPost: {
            ...state.repliesByPost,
            [postId]: [...existing, data as Reply],
          },
        };
      });
    }

    return { error: null };
  },

  subscribeToReplies: (postId: string) => {
    const channel = supabase
      .channel(`replies-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "replies",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          set((state) => {
            const newReply = payload.new as Reply;
            const existing = state.repliesByPost[postId] || [];

            if (existing.some((r) => r.id === newReply.id)) return state;

            return {
              repliesByPost: {
                ...state.repliesByPost,
                [postId]: [...existing, newReply],
              },
            };
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
