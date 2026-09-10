export type PostCategory = "confession" | "rant" | "funny" | "advice";

export interface Post {
  id: string;
  content: string;
  category: PostCategory;
  campus: string;
  created_at: string;
  reaction_heart: number;
  reaction_shock: number;
  reaction_sad: number;
  reaction_laugh: number;
  report_count: number;
}

export type ReactionType =
  | "reaction_heart"
  | "reaction_shock"
  | "reaction_sad"
  | "reaction_laugh";
