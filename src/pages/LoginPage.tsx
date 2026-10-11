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

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit() {
    setIsSubmitting(true);
    setFormError("");

    try {
      await signIn(email, password);

      await navigate({ to: "/" });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Не удалось войти");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Stack>
      <Title order={3}>Вход</Title>

      {formError && (
        <Alert color="red" title="Ошибка">
          {formError}
        </Alert>
      )}

      <TextInput
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.currentTarget.value)}
        required
      />

      <PasswordInput
        label="Пароль"
        value={password}
        onChange={(event) => setPassword(event.currentTarget.value)}
        required
      />

      <Button fullWidth loading={isSubmitting} onClick={handleSubmit}>
        Войти
      </Button>

      <Button component={Link} to="/register" variant="subtle" fullWidth>
        Создать аккаунт
      </Button>
    </Stack>
  );
}
