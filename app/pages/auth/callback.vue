<template>
  <main
    class="flex min-h-dvh items-center justify-center bg-surface-purple-subtle px-6"
  >
    <UCard
      class="w-full max-w-sm rounded-2xl bg-background shadow-sm ring-border"
    >
      <div v-if="hasOAuthError" class="space-y-4 text-center">
        <div class="space-y-2">
          <p class="text-base font-semibold text-foreground">
            No se pudo iniciar sesión
          </p>
          <p class="text-sm text-text-secondary">
            Inténtalo nuevamente o vuelve al inicio de sesión.
          </p>
        </div>

        <UButton :to="PATH.LOGIN" block color="primary">
          Volver a iniciar sesión
        </UButton>
      </div>

      <div v-else class="space-y-3 text-center">
        <p class="text-base font-semibold text-foreground">Iniciando sesión</p>
        <p class="text-sm text-text-secondary">
          Estamos verificando tu cuenta. Espera un momento.
        </p>
      </div>
    </UCard>
  </main>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { PATH } from "~/utils/path";
import { getQueryValue } from "~/utils/query";

const route = useRoute();

const authStore = useAuthStore();

const hasOAuthError = computed(
  () =>
    Boolean(getQueryValue(route.query.error_description)) ||
    Boolean(getQueryValue(route.query.error)),
);

onMounted(async () => {
  if (hasOAuthError.value) {
    return;
  }

  await navigateTo(authStore.isAuthenticated ? PATH.DASHBOARD : PATH.LOGIN);
});
</script>
