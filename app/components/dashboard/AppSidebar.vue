<template>
  <div class="flex h-full flex-col bg-background">
    <div class="flex h-16 shrink-0 items-center border-b border-border px-5">
      <NuxtLink
        to="/transcriptions"
        aria-label="Ir al inicio de Vocali"
        @click="handleNavigate"
      >
        <AuthLogo label-class="text-lg font-semibold tracking-tight text-foreground" />
      </NuxtLink>
    </div>

    <nav class="flex-1 px-3 py-5" aria-label="Navegación principal">
      <UNavigationMenu
        orientation="vertical"
        color="primary"
        variant="link"
        :items="navigationItems"
        class="w-full"
        :ui="{
          root: 'gap-1',
          link: 'h-11 gap-2.5 rounded-lg px-3 text-sm transition-colors',
          linkLeadingIcon: 'size-4.5 transition-colors',
        }"
      />
    </nav>

    <div class="border-t border-border p-3">
      <UButton
        color="neutral"
        variant="ghost"
        block
        icon="i-lucide-log-out"
        label="Cerrar sesión"
        class="h-11 cursor-pointer justify-start gap-2.5 rounded-lg px-3 text-text-secondary hover:bg-surface-purple-subtle hover:text-foreground"
        @click="handleLogout"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import type { NavigationEmit } from "~/common/types";
import AuthLogo from "~/components/auth/AuthLogo.vue";
import { useAuthStore } from "~/stores/auth";

const emit = defineEmits<NavigationEmit>();

const route = useRoute();
const authStore = useAuthStore();

const activeItemUi: NavigationMenuItem["ui"] = {
  link: "bg-surface-purple-subtle text-primary hover:bg-surface-purple-subtle hover:text-primary",
  linkLeadingIcon: "text-primary group-hover:text-primary",
};

const inactiveItemUi: NavigationMenuItem["ui"] = {
  link: "text-text-secondary hover:bg-surface-purple-subtle/70 hover:text-foreground",
  linkLeadingIcon: "text-text-muted group-hover:text-text-secondary",
};

function handleNavigate(): void {
  emit("navigate");
}

async function handleLogout(): Promise<void> {
  await authStore.logout();
}

const navigationItems = computed<NavigationMenuItem[]>(() => [
  {
    label: "Transcripciones",
    icon: "i-lucide-file-audio",
    to: "/transcriptions",
    active: route.path === "/transcriptions",
    ui: route.path === "/transcriptions" ? activeItemUi : inactiveItemUi,
    onSelect: handleNavigate,
  },
]);
</script>
