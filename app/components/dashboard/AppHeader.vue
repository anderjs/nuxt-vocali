<template>
  <header
    class="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-4 md:px-8"
  >
    <UButton
      class="md:hidden"
      color="neutral"
      variant="ghost"
      icon="i-lucide-menu"
      aria-label="Abrir navegación"
      @click="$emit('open-navigation')"
    />

    <h1 class="text-lg font-semibold text-foreground">
      {{ title }}
    </h1>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();

defineEmits<{
  "open-navigation": [];
}>();
</script>
