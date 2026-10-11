import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import { supabase } from "./utils/supabase";

import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";

const rootRoute = createRootRoute({
  component: Outlet,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "auth",
  component: AuthLayout,

  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      throw redirect({ to: "/" });
    }
  },
});

const mainRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "main",
  component: MainLayout,

  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw redirect({ to: "/login" });
    }
  },
});

const routeTree = rootRoute.addChildren([
  authRoute.addChildren([
    createRoute({
      getParentRoute: () => authRoute,
      path: "/login",
      component: LoginPage,
    }),
    createRoute({
      getParentRoute: () => authRoute,
      path: "/register",
      component: RegisterPage,
    }),
  ]),

  mainRoute.addChildren([
    createRoute({
      getParentRoute: () => mainRoute,
      path: "/",
      component: HomePage,
    }),
    createRoute({
      getParentRoute: () => mainRoute,
      path: "/profile",
      component: ProfilePage,
    }),
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
