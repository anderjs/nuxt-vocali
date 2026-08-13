<template>
  <main class="min-h-dvh bg-surface-purple-subtle">
    <div
      class="mx-auto grid min-h-dvh w-full max-w-6xl items-center gap-12 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(400px,448px)] lg:gap-20 lg:px-12"
    >
      <LoginBrandPanel />

      <section class="flex w-full justify-center lg:justify-end">
        <LoginFormCard
          :error-message="loginError"
          @google-sign-in="handleGoogleSignIn"
          @submit="handleLogin"
        />
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import LoginFormCard from "~/components/auth/LoginFormCard.vue";
import LoginBrandPanel from "~/components/auth/LoginBrandPanel.vue";
import type { LoginSchema } from "~/schemas/login.schema";
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();
const loginError = ref<string>();

definePageMeta({ middleware: "guest" });

const handleLogin = async ({ email, password }: LoginSchema) => {
  loginError.value = undefined;

  try {
    await authStore.signIn(email, password);
    await navigateTo("/dashboard");
  } catch {
    loginError.value =
      "No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo.";
  }
};

const handleGoogleSignIn = async () => {
  await authStore.signInWithGoogle();
};
</script>
