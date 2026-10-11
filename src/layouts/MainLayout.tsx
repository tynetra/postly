import {
  Avatar,
  Container,
  Grid,
  Group,
  NavLink,
  Paper,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";

import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Feather, House, Search } from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";

const navigation = [{ label: "Главная", to: "/", icon: House }];

export default function MainLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const { user } = useAuth();
  const { profile } = useProfile(user?.id);

  const displayName =
    [profile?.firstname, profile?.lastname].filter(Boolean).join(" ") ||
    "Пользователь";

  const username = profile?.username || "user";

  return (
    <Container size={1400} px="md">
      <Grid>
        <Grid.Col span={{ base: 2, sm: 3, md: 3 }}>
          <Stack gap="md" mt="md">
            <Group px="sm" gap="xs">
              <Feather size={30} color="#1D9BF0" />
              <Text size="xl" fw={800} c="#1D9BF0">
                Postly
              </Text>
            </Group>

            <Stack gap={4}>
              {navigation.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  component={Link}
                  to={to}
                  label={label}
                  leftSection={<Icon size={22} />}
                  active={pathname === to}
                  variant="subtle"
                />
              ))}
            </Stack>

            <UnstyledButton
              component={Link}
              to="/profile"
              mt="xl"
              p="xs"
              style={{ borderRadius: 8 }}
            >
              <Group wrap="nowrap">
                <Avatar src={profile?.avatar_url} color="blue" radius="xl">
                  {displayName.charAt(0).toUpperCase()}
                </Avatar>

                <Stack gap={0}>
                  <Text size="sm" fw={700}>
                    {displayName}
                  </Text>

                  <Text size="xs" c="dimmed">
                    @{username}
                  </Text>
                </Stack>
              </Group>
            </UnstyledButton>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 10, sm: 9, md: 6 }}>
          <Stack gap={0}>
            <Paper p="md" radius={0}>
              <TextInput
                placeholder="Поиск"
                leftSection={<Search size={18} />}
                radius="xl"
              />
            </Paper>

            <Outlet />
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
