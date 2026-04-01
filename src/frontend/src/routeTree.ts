import {
  createRootRoute,
  createRoute,
  type createRouter,
} from "@tanstack/react-router";
import RootLayout from "./layouts/RootLayout";
import AdminPage from "./pages/AdminPage";
import BookingPage from "./pages/BookingPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import HowItWorksPage from "./pages/HowItWorksPage";
import ProviderPage from "./pages/ProviderPage";
import ServicesPage from "./pages/ServicesPage";
import TrackOrderPage from "./pages/TrackOrderPage";

export const rootRoute = createRootRoute({ component: RootLayout });

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

export const servicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/services",
  component: ServicesPage,
});

export const bookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/booking",
  component: BookingPage,
});

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

export const trackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/track",
  component: TrackOrderPage,
});

export const howItWorksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/how-it-works",
  component: HowItWorksPage,
});

export const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

export const providerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/provider",
  component: ProviderPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  servicesRoute,
  bookingRoute,
  dashboardRoute,
  trackRoute,
  howItWorksRoute,
  adminRoute,
  providerRoute,
]);

export type Router = ReturnType<typeof createRouter<typeof routeTree>>;
