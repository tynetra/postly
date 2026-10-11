import { Center, Loader, Stack, Text } from "@mantine/core";

export default function PageLoading() {
  return (
    <Center mih="100vh">
      <Stack align="center" gap="sm">
        <Loader size="lg" />
        <Text c="dimmed" size="sm">
          Загружаем...
        </Text>
      </Stack>
    </Center>
  );
}
