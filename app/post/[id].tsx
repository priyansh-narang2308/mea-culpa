import { usePostsStore } from "@/stores/usePostsStore";
import { Reply } from "@/types/reply";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

const EMPTY_REPLIES: Reply[] = [];

const PostDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const post = usePostsStore((s) => s.posts.find((p) => p.id === id));
  

  return <Text>Hello</Text>;
};

export default PostDetailScreen;
