<template>
  <main class="flex min-h-screen items-center justify-center bg-surface-purple-subtle px-6">
    <UCard class="w-full max-w-sm rounded-2xl bg-background shadow-sm ring-border">
      <div class="space-y-3 text-center">
        <p class="text-base font-semibold text-foreground">Iniciando sesión</p>
        <p class="text-sm text-text-secondary">
          Estamos verificando tu cuenta. Espera un momento.
        </p>
      </div>
    </UCard>
  </main>
</template>

<script setup lang="ts">
import { navigateTo, onMounted } from "#imports";
import { useAuthStore } from "~/store/user";

const authStore = useAuthStore();

onMounted(async () => {
  try {
    await authStore.handleSigninCallback();
    await navigateTo("/dashboard");
  } catch (error) {
    console.error("Cognito callback failed", error);
    await navigateTo("/login");
  }
});
</script>
