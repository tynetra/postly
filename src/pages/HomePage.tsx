import { useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { Heart, MessageCircle, Repeat2, Trash2 } from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import { usePosts } from "../hooks/usePosts";
import { useProfile } from "../hooks/useProfile";

export default function HomePage() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);

  const {
    posts,
    isLoading,
    isError,
    error,
    addPost,
    isAdding,
    removePost,
    isDeleting,
  } = usePosts();

  const [postText, setPostText] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const displayName =
    [profile?.firstname, profile?.lastname].filter(Boolean).join(" ") ||
    profile?.username ||
    "Пользователь";

  async function handleAddPost() {
    if (!user || !postText.trim()) return;

    setSubmitError("");

    try {
      await addPost({
        content: postText,
        userId: user.id,
      });

      setPostText("");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Не удалось добавить публикацию.",
      );
    }
  }

  async function handleDeletePost(postId: string) {
    setDeleteError("");

    try {
      await removePost(postId);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Не удалось удалить публикацию.",
      );
    }
  }

  return (
    <Stack gap={0}>
      <Title order={2} p="md">
        Главная
      </Title>

      <Divider />

      <Stack p="md" gap="sm">
        {submitError && (
          <Alert color="red" title="Ошибка">
            {submitError}
          </Alert>
        )}

        <Group align="flex-start" wrap="nowrap">
          <Avatar src={profile?.avatar_url} color="blue" radius="xl">
            {displayName.charAt(0).toUpperCase()}
          </Avatar>

          <Stack gap="sm" style={{ flex: 1 }}>
            <Textarea
              placeholder="Что нового?"
              autosize
              minRows={2}
              maxRows={6}
              maxLength={5000}
              value={postText}
              onChange={(event) => setPostText(event.currentTarget.value)}
            />

            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                {postText.length}/5000
              </Text>

              <Button
                radius="xl"
                loading={isAdding}
                disabled={!user || !postText.trim()}
                onClick={handleAddPost}
              >
                Добавить
              </Button>
            </Group>
          </Stack>
        </Group>
      </Stack>

      <Divider />

      {isLoading && (
        <Text c="dimmed" ta="center" p="xl">
          Загружаем публикации...
        </Text>
      )}

      {isError && (
        <Alert color="red" title="Не удалось загрузить ленту" m="md">
          {error instanceof Error
            ? error.message
            : "Попробуй обновить страницу."}
        </Alert>
      )}

      {deleteError && (
        <Alert color="red" title="Не удалось удалить публикацию" m="md">
          {deleteError}
        </Alert>
      )}

      {!isLoading && !isError && posts.length === 0 && (
        <Text c="dimmed" ta="center" p="xl">
          Пока публикаций нет. Будь первым!
        </Text>
      )}

      {posts.map((post) => {
        const author = post.author;

        const authorName = author
          ? [author.firstname, author.lastname].filter(Boolean).join(" ") ||
            author.username ||
            "Пользователь"
          : "Пользователь";

        const authorUsername = author?.username || "user";
        const isOwnPost = post.user_id === user?.id;

        return (
          <Card key={post.id} radius={0} padding="md">
            <Stack gap="sm">
              <Group align="flex-start" wrap="nowrap">
                <Avatar src={author?.avatar_url} color="blue" radius="xl">
                  {authorName.charAt(0).toUpperCase()}
                </Avatar>

                <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                  <Group gap={6} wrap="wrap">
                    <Text fw={700}>{authorName}</Text>

                    <Text c="dimmed" size="sm">
                      @{authorUsername}
                    </Text>

                    <Text c="dimmed" size="sm">
                      · {new Date(post.created_at).toLocaleString("ru-RU")}
                    </Text>
                  </Group>

                  <Text
                    style={{
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {post.content}
                  </Text>
                </Stack>
              </Group>

              <Group justify="space-around" mt="xs">
                <Button
                  variant="subtle"
                  color="gray"
                  size="compact-sm"
                  leftSection={<MessageCircle size={16} />}
                  disabled
                >
                  Ответить
                </Button>

                <Button
                  variant="subtle"
                  color="gray"
                  size="compact-sm"
                  leftSection={<Repeat2 size={16} />}
                  disabled
                >
                  Репост
                </Button>

                <Button
                  variant="subtle"
                  color="gray"
                  size="compact-sm"
                  leftSection={<Heart size={16} />}
                  disabled
                >
                  Нравится
                </Button>

                {isOwnPost && (
                  <Button
                    variant="subtle"
                    color="red"
                    size="compact-sm"
                    leftSection={<Trash2 size={16} />}
                    loading={isDeleting}
                    onClick={() => handleDeletePost(post.id)}
                  >
                    Удалить
                  </Button>
                )}
              </Group>
            </Stack>

            <Divider mt="md" />
          </Card>
        );
      })}
    </Stack>
  );
}
