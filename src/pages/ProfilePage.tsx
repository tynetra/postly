import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Group,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { LogOut, Save } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const {
    profile,
    isLoading: isProfileLoading,
    error: profileError,
    updateProfile,
  } = useProfile(user?.id);

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (profile) {
      setFirstname(profile.firstname);
      setLastname(profile.lastname);
      setUsername(profile.username ?? "");
      setBio(profile.bio);
    }
  }, [profile]);

  async function handleSave() {
    setError("");
    setSuccess("");

    const first = firstname.trim();
    const last = lastname.trim();
    const nick = username.trim().toLowerCase();

    if (!first || !last) {
      setError("Имя и фамилия обязательны.");
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(nick)) {
      setError(
        "Username должен содержать 3–30 символов: латинские буквы, цифры или _.",
      );
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile({
        firstname: first,
        lastname: last,
        username: nick,
        avatar_url: profile?.avatar_url ?? null,
        bio: bio.trim(),
      });

      setSuccess("Профиль успешно сохранён.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось сохранить профиль.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    setError("");

    try {
      await signOut();
      await navigate({ to: "/login" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось выйти из аккаунта.",
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  if (isProfileLoading) {
    return <Text c="dimmed">Загрузка профиля...</Text>;
  }

  if (profileError) {
    return (
      <Alert color="red" title="Ошибка загрузки профиля">
        {profileError}
      </Alert>
    );
  }

  if (!profile) {
    return (
      <Alert color="yellow" title="Профиль не найден">
        Для этого пользователя нет записи в таблице profiles.
      </Alert>
    );
  }

  const displayName = `${firstname} ${lastname}`.trim();
  const avatarLetter = (displayName || username || "U").charAt(0).toUpperCase();

  return (
    <Stack>
      <Title order={2}>Профиль</Title>

      {error && (
        <Alert color="red" title="Ошибка">
          {error}
        </Alert>
      )}

      {success && (
        <Alert color="green" title="Готово">
          {success}
        </Alert>
      )}

      <Group>
        <Avatar src={profile.avatar_url} size={80} radius="xl" color="blue">
          {avatarLetter}
        </Avatar>

        <Stack gap={2}>
          <Text fw={700}>{displayName || "Пользователь"}</Text>
          <Text c="dimmed" size="sm">
            @{username || "без_ника"}
          </Text>
          <Text c="dimmed" size="sm">
            {user?.email}
          </Text>
        </Stack>
      </Group>

      <TextInput
        label="Имя"
        placeholder="Твоё имя"
        value={firstname}
        onChange={(event) => setFirstname(event.currentTarget.value)}
        required
      />

      <TextInput
        label="Фамилия"
        placeholder="Твоя фамилия"
        value={lastname}
        onChange={(event) => setLastname(event.currentTarget.value)}
        required
      />

      <TextInput
        label="Имя пользователя"
        description="3–30 символов: латинские буквы, цифры и _"
        placeholder="например, arnold_123"
        value={username}
        onChange={(event) => setUsername(event.currentTarget.value)}
        required
      />

      <Textarea
        label="О себе"
        placeholder="Расскажи немного о себе"
        value={bio}
        onChange={(event) => setBio(event.currentTarget.value)}
        maxLength={300}
        autosize
        minRows={3}
      />

      <Button
        leftSection={<Save size={18} />}
        loading={isSaving}
        onClick={handleSave}
      >
        Сохранить профиль
      </Button>

      <Button
        color="red"
        variant="light"
        leftSection={<LogOut size={18} />}
        loading={isSigningOut}
        onClick={handleSignOut}
      >
        Выйти из аккаунта
      </Button>
    </Stack>
  );
}
