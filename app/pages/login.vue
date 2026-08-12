<template>
  <main class="min-h-screen bg-surface-purple-subtle">
    <div
      class="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-12 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(400px,448px)] lg:gap-20 lg:px-12"
    >
      <LoginBrandPanel />

      <section class="flex w-full justify-center lg:justify-end">
        <LoginFormCard @submit="handleLogin" />
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { navigateTo } from "#imports";
import LoginBrandPanel from "~/components/auth/LoginBrandPanel.vue";
import LoginFormCard from "~/components/auth/LoginFormCard.vue";

const handleLogin = async () => {
  await navigateTo("/dashboard");
};
</script>
