<template>
  <UButton
    color="primary"
    variant="solid"
    icon="i-lucide-plus"
    label="Nueva transcripción"
    class="cursor-pointer font-semibold text-white hover:bg-primary-hover [&_svg]:text-white"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import type { ClickEmit } from "~/common/types";

const emit = defineEmits<ClickEmit>();

function handleClick(): void {
  emit("click");
}
</script>
