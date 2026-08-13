<template>
  <div class="overflow-hidden rounded-xl border border-border bg-background">
    <UTable
      :data="page.items"
      :columns="columns"
      :ui="{
        thead: 'border-b border-border',
        tbody: 'divide-y divide-border',
        tr: 'transition-colors hover:bg-surface-purple-subtle/30',
        th: 'bg-surface-purple-subtle/50 text-xs font-semibold uppercase tracking-wide text-text-secondary',
        td: 'text-sm text-foreground',
      }"
    >
      <template #type-cell="{ row }">
        {{ typeLabels[row.original.type] }}
      </template>

      <template #status-cell="{ row }">
        <UBadge
          :color="statusConfig[row.original.status].color"
          variant="soft"
          :label="statusConfig[row.original.status].label"
        />
      </template>

      <template #createdAt-cell="{ row }">
        {{ formatShortDateEs(row.original.createdAt) }}
      </template>

      <template #actions-cell>
        <div class="flex justify-end gap-1">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-eye"
            label="Ver"
            class="cursor-pointer text-text-secondary hover:bg-surface-purple-subtle hover:text-foreground"
          />
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-download"
            label="Descargar"
            class="cursor-pointer text-text-secondary hover:bg-surface-purple-subtle hover:text-foreground"
          />
        </div>
      </template>
    </UTable>

    <div
      class="flex items-center justify-between border-t border-border px-4 py-3"
    >
      <p class="text-xs text-text-muted">
        Hasta {{ pageSize }} transcripciones por página
      </p>
      <UButton
        color="neutral"
        variant="outline"
        size="sm"
        label="Siguiente"
        trailing-icon="i-lucide-chevron-right"
        :class="page.nextCursor ? 'cursor-pointer' : 'cursor-not-allowed'"
        :disabled="!page.nextCursor"
        @click="handleNextClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { TranscriptionsTableEmit } from "~/common/types";
import type {
  TranscriptionListItem,
  TranscriptionPage,
  TranscriptionStatus,
  TranscriptionType,
} from "~/types/transcription";
import { formatShortDateEs } from "~/utils/date";

const props = defineProps<{
  page: TranscriptionPage;
  pageSize?: number;
}>();

const emit = defineEmits<TranscriptionsTableEmit>();

const columns: TableColumn<TranscriptionListItem>[] = [
  { accessorKey: "name", header: "Nombre" },
  { accessorKey: "type", header: "Tipo" },
  { accessorKey: "status", header: "Estado" },
  { accessorKey: "createdAt", header: "Fecha" },
  { id: "actions", header: "Acciones", meta: { class: { th: "text-right" } } },
];

const typeLabels: Record<TranscriptionType, string> = {
  file: "Archivo",
  realtime: "En vivo",
};

const statusConfig: Record<
  TranscriptionStatus,
  { label: string; color: "success" | "warning" | "error" }
> = {
  completed: { label: "Completada", color: "success" },
  processing: { label: "Procesando", color: "warning" },
  error: { label: "Error", color: "error" },
};

function handleNextClick(): void {
  if (props.page.nextCursor) {
    emit("next", props.page.nextCursor);
  }
}
</script>
