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
      </div>

      <NewTranscriptionButton
        class="self-start"
        @click="openNewTranscriptionModal"
      />
    </div>

    <TranscriptionsTable
      v-if="transcriptionPage.items.length"
      :page="transcriptionPage"
      :page-size="10"
    />
    <TranscriptionsEmptyState v-else />

    <NewTranscriptionModal v-model:open="newTranscriptionOpen" />
  </section>
</template>

<script setup lang="ts">
import TranscriptionsTable from "~/components/transcriptions/TranscriptionsTable.vue";
import NewTranscriptionModal from "~/components/transcriptions/NewTranscriptionModal.vue";
import NewTranscriptionButton from "~/components/transcriptions/NewTranscriptionButton.vue";
import TranscriptionsEmptyState from "~/components/transcriptions/TranscriptionsEmptyState.vue";
import type { TranscriptionPage } from "~/types/transcription";
import { TRANSCRIPTIONS_PAGE_SIZE } from "~/utils/constants";

const newTranscriptionOpen = ref(false);

const transcriptionPage: TranscriptionPage = {
  items: [],
  nextCursor: null,
};

function openNewTranscriptionModal(): void {
  newTranscriptionOpen.value = true;
}

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});
</script>
