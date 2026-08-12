<template>
  <div class="flex items-center gap-3">
    <div
      class="flex size-10 items-center justify-center rounded-xl bg-primary font-bold text-white"
    >
      V
    </div>
    <span :class="labelClass">Vocali</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    labelClass?: string;
  }>(),
  {
    labelClass: "text-xl font-semibold tracking-tight text-foreground",
  },
);
</script>
