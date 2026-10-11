import { Container, Paper, Stack, Text, Title } from "@mantine/core";

import { Outlet } from "@tanstack/react-router";

export default function AuthLayout() {
  return (
    <Container size={420} py={80}>
      <Stack align="center" mb="xl" gap="xs">
        <Title order={2}>Social App</Title>

        <Text c="dimmed" size="sm" ta="center">
          Общайся и делись публикациями
        </Text>
      </Stack>

      <Paper withBorder shadow="sm" radius="md" p="xl">
        <Outlet />
      </Paper>
    </Container>
  );
}
