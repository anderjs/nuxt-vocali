import { useAuthStore } from "~/stores/auth";
import { PATH } from "~/utils/path";

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return;
  }

  const authStore = useAuthStore();
  await authStore.initialize();

  if (authStore.isAuthenticated) {
    return navigateTo(PATH.DASHBOARD);
  }
});
