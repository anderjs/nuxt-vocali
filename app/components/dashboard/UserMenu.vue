<template>
  <UDropdownMenu
    :items="menuItems"
    :content="{ side: 'top', align: 'start', sideOffset: 8 }"
    :ui="{ content: 'w-56' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      block
      class="h-auto cursor-pointer justify-start rounded-lg p-2 text-left"
      aria-label="Abrir menú de usuario"
    >
      <UAvatar
        :text="initials"
        size="sm"
        class="shrink-0 bg-surface-purple text-primary"
      />

      <span class="min-w-0 flex-1">
        <span class="block truncate text-sm font-medium text-foreground">
          {{ displayName }}
        </span>
        <span
          v-if="authStore.user?.email"
          class="block truncate text-xs text-text-muted"
        >
          {{ authStore.user.email }}
        </span>
      </span>

      <UIcon name="i-lucide-chevrons-up-down" class="size-4 text-text-muted" />
    </UButton>
  </UDropdownMenu>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import type { DropdownMenuItem } from "@nuxt/ui";

const authStore = useAuthStore();

const displayName = computed(
  () => authStore.user?.email ?? authStore.user?.username ?? "Usuario",
);

const initials = computed(() => {
  const source = displayName.value.trim();

  return source.slice(0, 2).toUpperCase();
});

const menuItems = computed<DropdownMenuItem[]>(() => [
  {
    label: "Cerrar sesión",
    icon: "i-lucide-log-out",
    onSelect: () => authStore.logout(),
  },
]);
</script>
