<template>
  <div class="flex h-full flex-col bg-background">
    <div class="flex h-16 shrink-0 items-center px-5">
      <NuxtLink
        to="/dashboard"
        class="text-xl font-semibold tracking-tight text-foreground"
        @click="$emit('navigate')"
      >
        Vocali
      </NuxtLink>
    </div>

    <USeparator />

    <nav class="flex-1 px-3 py-5" aria-label="Navegación principal">
      <UNavigationMenu
        orientation="vertical"
        color="primary"
        variant="pill"
        :items="navigationItems"
        class="w-full"
        :ui="{
          link: 'rounded-lg px-3 py-2.5 text-sm',
          linkLeadingIcon: 'size-4.5',
        }"
      />
    </nav>

    <div class="border-t border-border p-3">
      <UserMenu />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const emit = defineEmits<{
  navigate: [];
}>();

const navigationItems: NavigationMenuItem[] = [
  {
    label: "Inicio",
    icon: "i-lucide-house",
    to: "/dashboard",
    onSelect: () => emit("navigate"),
  },
  {
    label: "Transcripciones",
    icon: "i-lucide-files",
    disabled: true,
  },
  {
    label: "Nueva transcripción",
    icon: "i-lucide-file-plus-2",
    disabled: true,
  },
];
</script>
