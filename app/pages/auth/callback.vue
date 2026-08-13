<template>
  <main
    class="flex min-h-dvh items-center justify-center bg-surface-purple-subtle px-6"
  >
    <UCard
      class="w-full max-w-sm rounded-2xl bg-background shadow-sm ring-border"
    >
      <div v-if="oauthError" class="space-y-4 text-center">
        <div class="space-y-2">
          <p class="text-base font-semibold text-foreground">
            No se pudo iniciar sesión
          </p>
          <p class="text-sm text-text-secondary">
            {{ oauthError }}
          </p>
        </div>

        <UButton to="/login" block color="primary">
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
import { getQueryValue } from "#imports";

const route = useRoute();

const authStore = useAuthStore();

/**
 * @description
 * Gets oauth error in case something happened.
 */
const oauthError = computed(() => {
  const description = getQueryValue(route.query?.error_description);

  if (description) {
    return description.replaceAll("+", " ");
  }

  return getQueryValue(route.query?.error);
});

/**
 * @description
 * Lifecycle to handle authentication.
 */
onMounted(async () => {
  /**
   * @description
   * OAuth error valuue.
   */
  if (oauthError.value) {
    return;
  }

  await navigateTo(authStore.isAuthenticated ? "/dashboard" : "/login");
});
</script>
