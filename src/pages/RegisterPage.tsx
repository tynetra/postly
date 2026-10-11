import { useState } from "react";
import {
  Alert,
  Button,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { Link, useNavigate } from "@tanstack/react-router";

import { useAuth } from "../hooks/useAuth";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setError("");
    setSuccess(false);

    const first = firstname.trim();
    const last = lastname.trim();
    const nick = username.trim().toLowerCase();
    const trimmedEmail = email.trim();

    if (!first || !last || !nick || !trimmedEmail || !password) {
      setError("Заполни все поля.");
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(nick)) {
      setError(
        "Username должен содержать 3–30 символов: латинские буквы, цифры или _.",
      );
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен содержать не менее 6 символов.");
      return;
    }

    setIsLoading(true);

    try {
      const { session } = await signUp({
        firstname: first,
        lastname: last,
        username: nick,
        email: trimmedEmail,
        password,
      });

      if (session) {
        await navigate({ to: "/" });
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось зарегистрироваться.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Stack>
      <Title order={3}>Регистрация</Title>

      {error && <Alert color="red">{error}</Alert>}

      {success && (
        <Alert color="green">
          Проверь почту и подтверди email, если Supabase запросил подтверждение.
          После этого войди в аккаунт.
        </Alert>
      )}

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
        label="Username"
        placeholder="например, arnold_123"
        description="3–30 символов: латиница, цифры и нижнее подчёркивание"
        value={username}
        onChange={(event) => setUsername(event.currentTarget.value)}
        required
      />

      <TextInput
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.currentTarget.value)}
        required
      />

      <PasswordInput
        label="Пароль"
        placeholder="Минимум 6 символов"
        value={password}
        onChange={(event) => setPassword(event.currentTarget.value)}
        required
      />

      <Button fullWidth loading={isLoading} onClick={handleSubmit}>
        Зарегистрироваться
      </Button>

      <Button component={Link} to="/login" variant="subtle" fullWidth>
        Уже есть аккаунт? Войти
      </Button>
    </Stack>
  );
}
