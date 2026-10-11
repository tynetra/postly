import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "../utils/supabase";

export type PostAuthor = {
  id: string;
  username: string | null;
  firstname: string;
  lastname: string;
  avatar_url: string | null;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author: PostAuthor | null;
};

type CreatePostData = {
  content: string;
  userId: string;
};

const POSTS_QUERY_KEY = ["posts"];

async function fetchPosts(): Promise<Post[]> {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, user_id, content, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!posts?.length) return [];

  const userIds = [...new Set(posts.map((post) => post.user_id))];

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username, firstname, lastname, avatar_url")
    .in("id", userIds);

  if (profilesError) throw profilesError;

  const profilesById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  return posts.map((post) => ({
    ...post,
    author: profilesById.get(post.user_id) ?? null,
  })) as Post[];
}

async function createPost({ content, userId }: CreatePostData): Promise<void> {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error("Напиши текст публикации.");
  }

  if (trimmedContent.length > 5000) {
    throw new Error("Максимум 5000 символов.");
  }

  const { error } = await supabase.from("posts").insert({
    content: trimmedContent,
    user_id: userId,
  });

  if (error) throw error;
}

async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) throw error;
}

export function usePosts() {
  const queryClient = useQueryClient();

  const postsQuery = useQuery({
    queryKey: POSTS_QUERY_KEY,
    queryFn: fetchPosts,
  });

  const addMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY }),
  });

  useEffect(() => {
    const channel = supabase
      .channel("posts-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: POSTS_QUERY_KEY,
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    posts: postsQuery.data ?? [],
    isLoading: postsQuery.isPending,
    isError: postsQuery.isError,
    error: postsQuery.error,
    refetch: postsQuery.refetch,

    addPost: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    addPostError: addMutation.error,

    removePost: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deletePostError: deleteMutation.error,
  };
}
