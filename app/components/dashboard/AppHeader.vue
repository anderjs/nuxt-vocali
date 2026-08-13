<template>
  <header
    class="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-4 md:px-8"
  >
    <UButton
      class="cursor-pointer md:hidden"
      color="neutral"
      variant="ghost"
      icon="i-lucide-menu"
      aria-label="Abrir navegación"
      @click="openNavigation"
    />

    <div class="ml-auto flex min-w-0 items-center">
      <UAvatar
        :text="initials"
        size="sm"
        class="shrink-0 bg-surface-purple text-primary"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import type { OpenNavigationEmit } from "~/common/types";
import { useAuthStore } from "~/stores/auth";
import { getIdentityLabel, getInitials } from "~/utils/user";

const emit = defineEmits<OpenNavigationEmit>();

const authStore = useAuthStore();

const identitySource = computed(() => getIdentityLabel(authStore.user));
const initials = computed(() => getInitials(identitySource.value));

function openNavigation(): void {
  emit("open-navigation");
}
</script>
