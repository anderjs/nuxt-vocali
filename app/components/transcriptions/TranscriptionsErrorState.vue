<template>
  <div class="rounded-xl border border-border bg-background px-5 py-5 sm:px-6">
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex min-w-0 gap-3">
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-purple-subtle text-primary"
        >
          <UIcon name="i-lucide-circle-alert" class="size-5" />
        </div>

        <div class="min-w-0 self-center">
          <h2 class="text-sm font-semibold text-foreground">
            No pudimos cargar las transcripciones
          </h2>
        </div>
      </div>

      <UButton
        color="primary"
        variant="subtle"
        size="sm"
        icon="i-lucide-refresh-cw"
        label="Reintentar"
        class="shrink-0 cursor-pointer self-start sm:self-center"
        @click="emit('click')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ClickEmit } from "~/common/types";

const emit = defineEmits<ClickEmit>();
</script>
