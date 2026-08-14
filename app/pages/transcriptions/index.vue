<template>
  <section class="space-y-6">
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">
          Transcripciones
        </h1>
        <p class="mt-1 text-sm text-text-secondary">
          Gestiona y consulta tus transcripciones.
        </p>
        <p
          v-if="lastUpdatedAt"
          class="mt-2 text-xs text-text-muted"
        >
          Última actualización: {{ formatLastUpdatedEs(lastUpdatedAt) }}
        </p>
      </div>

      <NewTranscriptionButton
        class="self-start"
        @click="openNewTranscriptionModal"
      />
    </div>

    <div
      v-if="initialLoading"
      class="flex min-h-96 items-center justify-center rounded-xl border border-border bg-background px-6 py-14 text-center"
    >
      <div class="space-y-3">
        <UIcon
          name="i-lucide-loader-circle"
          class="mx-auto size-6 animate-spin text-primary"
        />
        <p class="text-sm text-text-secondary">Cargando transcripciones...</p>
      </div>
    </div>

    <TranscriptionsErrorState
      v-else-if="error && !hasLoadedOnce"
      @click="refresh"
    />

    <TranscriptionsTable
      v-else-if="transcriptions.items.length"
      :page="transcriptions"
      class="transition-opacity duration-200"
      :class="isRefreshing ? 'opacity-90' : 'opacity-100'"
      @download="handleDownload"
      @next="next"
    />
    <TranscriptionsEmptyState v-else />

    <NewTranscriptionModal
      v-model:open="newTranscriptionOpen"
      @uploaded="handleTranscriptionUploaded"
    />
  </section>
</template>

<script setup lang="ts">
import TranscriptionsTable from "~/components/transcriptions/TranscriptionsTable.vue";
import NewTranscriptionModal from "~/components/transcriptions/NewTranscriptionModal.vue";
import NewTranscriptionButton from "~/components/transcriptions/NewTranscriptionButton.vue";
import TranscriptionsEmptyState from "~/components/transcriptions/TranscriptionsEmptyState.vue";
import TranscriptionsErrorState from "~/components/transcriptions/TranscriptionsErrorState.vue";
import { formatLastUpdatedEs } from "~/utils/date";

const newTranscriptionOpen = ref(false);
const toast = useToast();

const {
  download,
  error,
  hasLoadedOnce,
  initialLoading,
  isRefreshing,
  lastUpdatedAt,
  next,
  refresh,
  transcriptions,
} = useTranscriptions();

function openNewTranscriptionModal(): void {
  newTranscriptionOpen.value = true;
}

async function handleTranscriptionUploaded(): Promise<void> {
  await refresh();
}

async function handleDownload(id: string): Promise<void> {
  try {
    await download(id);
  } catch {
    toast.add({
      title: "No pudimos descargar la transcripción",
      description: "Inténtalo nuevamente en unos instantes.",
      color: "error",
    });
  }
}

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});
</script>
