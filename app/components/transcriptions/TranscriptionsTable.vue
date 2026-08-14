<template>
  <div class="overflow-hidden rounded-xl border border-border bg-background">
    <UTable
      :data="page.items"
      :columns="columns"
      :on-select="handleRowSelect"
      @keydown="handleTableKeydown"
      :ui="{
        thead: 'border-b border-border',
        tbody: 'divide-y divide-border',
        tr: 'cursor-pointer transition-colors hover:bg-surface-purple-subtle/30 focus-visible:bg-surface-purple-subtle/30',
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

      <template #actions-cell="{ row }">
        <div class="flex justify-end gap-1">
          <UTooltip text="Descargar">
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              square
              icon="i-lucide-download"
              aria-label="Descargar transcripción"
              :disabled="row.original.status !== 'completed'"
              :class="
                row.original.status === 'completed'
                  ? 'cursor-pointer text-text-secondary hover:bg-surface-purple-subtle hover:text-foreground'
                  : 'cursor-not-allowed text-text-muted'
              "
              @click.stop
            />
          </UTooltip>
        </div>
      </template>
    </UTable>

    <div
      v-if="page.nextCursor"
      class="flex justify-end border-t border-border px-4 py-3"
    >
      <UButton
        color="neutral"
        variant="outline"
        size="sm"
        label="Cargar más"
        trailing-icon="i-lucide-chevron-down"
        class="cursor-pointer"
        @click="handleNextClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn, TableRow } from "@nuxt/ui";
import type { TranscriptionsTableEmit } from "~/common/types";
import type {
  TranscriptionListItem,
  TranscriptionPage,
  TranscriptionStatus,
  TranscriptionType,
} from "~/types/transcription";
import { formatShortDateEs } from "~/utils/date";
import { getTranscriptionPath } from "~/utils/path";

const props = defineProps<{
  page: TranscriptionPage;
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

function handleRowSelect(
  _event: Event,
  row: TableRow<TranscriptionListItem>,
): void {
  openTranscription(row.original.id);
}

function handleTableKeydown(event: KeyboardEvent): void {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const target = event.target;

  if (!(target instanceof HTMLElement) || target.closest("button, a")) {
    return;
  }

  const row = target.closest("tr");

  if (!(row instanceof HTMLTableRowElement)) {
    return;
  }

  const transcription = props.page.items[row.sectionRowIndex];

  if (!transcription) {
    return;
  }

  event.preventDefault();
  openTranscription(transcription.id);
}

function openTranscription(id: string): void {
  void navigateTo(getTranscriptionPath(id));
}

function handleNextClick(): void {
  if (props.page.nextCursor) {
    emit("next", props.page.nextCursor);
  }
}
</script>
