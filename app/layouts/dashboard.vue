<template>
  <div class="flex min-h-dvh bg-surface-purple-subtle/50">
    <aside
      class="fixed inset-y-0 left-0 hidden w-64 border-r border-border md:block"
    >
      <AppSidebar />
    </aside>

    <USlideover
      v-model:open="mobileNavigationOpen"
      side="left"
      title="Navegación"
      description="Navegación principal de Vocali"
      :ui="{ content: 'w-64 max-w-[85vw]', header: 'hidden', body: 'p-0' }"
    >
      <template #body>
        <AppSidebar @navigate="mobileNavigationOpen = false" />
      </template>
    </USlideover>

    <div class="flex min-h-dvh min-w-0 flex-1 flex-col md:pl-64">
      <AppHeader @open-navigation="mobileNavigationOpen = true" />

      <main class="flex-1 p-6 md:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "~/components/dashboard/AppHeader.vue";
import AppSidebar from "~/components/dashboard/AppSidebar.vue";

const mobileNavigationOpen = ref(false);
</script>
