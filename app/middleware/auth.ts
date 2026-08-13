import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return;
  }

  const authStore = useAuthStore();
  await authStore.initialize();

  if (!authStore.isAuthenticated) {
    return navigateTo("/login");
  }
});
