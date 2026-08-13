<template>
  <div class="flex h-full flex-col bg-background">
    <div class="flex h-16 shrink-0 items-center border-b border-border px-5">
      <NuxtLink
        :to="PATH.TRANSCRIPTIONS"
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
:ui="sidebarNavigationMenuUi"
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
import {
  getSidebarNavigationItemUi,
  sidebarNavigationMenuUi,
} from "~/utils/navigation-menu";
import { PATH } from "~/utils/path";

const emit = defineEmits<NavigationEmit>();

const route = useRoute();
const authStore = useAuthStore();

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
    to: PATH.TRANSCRIPTIONS,
    active: route.path === PATH.TRANSCRIPTIONS,
    ui: getSidebarNavigationItemUi(route.path === PATH.TRANSCRIPTIONS),
    onSelect: handleNavigate,
  },
]);
</script>
