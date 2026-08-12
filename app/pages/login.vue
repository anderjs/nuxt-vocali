<template>
  <main class="min-h-screen bg-surface-purple-subtle">
    <div
      class="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-12 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(400px,448px)] lg:gap-20 lg:px-12"
    >
      <LoginBrandPanel />

      <section class="flex w-full justify-center lg:justify-end">
        <LoginFormCard
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
import { useAuthStore } from "~/store/user";

const authStore = useAuthStore();

const handleLogin = async () => {
  await authStore.signIn();
};

const handleGoogleSignIn = async () => {
  await authStore.signInWithGoogle();
};
</script>
