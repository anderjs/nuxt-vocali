<template>
  <section class="mx-auto w-full max-w-5xl space-y-5">
    <UButton
      :to="PATH.TRANSCRIPTIONS"
      color="neutral"
      variant="ghost"
      size="sm"
      icon="i-lucide-arrow-left"
      label="Transcripciones"
      class="-ml-5 w-fit cursor-pointer text-text-secondary hover:text-primary sm:-ml-6"
    />

    <div v-if="pending" class="flex min-h-64 items-center justify-center">
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-primary" />
    </div>

    <div v-else-if="error || !transcription" class="rounded-xl border border-border bg-background px-6 py-10 text-center">
      <h1 class="text-base font-semibold text-foreground">No pudimos cargar la transcripción</h1>
      <UButton color="primary" variant="subtle" label="Reintentar" class="mt-4 cursor-pointer" @click="handleRetry" />
    </div>

    <div v-else class="space-y-8">
      <header class="space-y-5">
        <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <h1 class="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
              {{ pageTitle }}
            </h1>
            <p
              v-if="isRealtime"
              class="mt-1.5 max-w-2xl truncate text-sm text-text-muted"
              :title="transcription.fileName"
            >
              {{ transcription.fileName }}
            </p>
          </div>

          <UButton
            color="primary"
            variant="solid"
            icon="i-lucide-download"
            label="Descargar"
            class="shrink-0 self-start cursor-pointer font-medium text-white hover:bg-primary-hover [&_svg]:text-white"
            :disabled="!isCompleted"
            :loading="downloading"
            @click="handleDownload"
          />
        </div>

        <div class="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-text-secondary">
          <span>{{ TRANSCRIPTION_TYPE_LABELS[transcription.type] }}</span>
          <span aria-hidden="true" class="text-text-muted">·</span>
          <TranscriptionStatusBadge :status="displayStatus" />
          <span aria-hidden="true" class="text-text-muted">·</span>
          <span>{{ formatShortDateEs(transcription.createdAt) }}</span>
        </div>
      </header>

      <section
        v-if="isCompleted"
        class="rounded-xl border border-border bg-background px-6 py-7 sm:px-10 sm:py-9"
      >
        <div class="max-w-3xl">
          <h2 class="text-base font-semibold text-foreground">Transcripción</h2>
          <p
            v-if="transcription.text"
            class="mt-6 whitespace-pre-wrap text-base leading-7 text-foreground sm:text-[1.0625rem] sm:leading-8"
          >
            {{ transcription.text }}
          </p>
          <p v-else class="mt-6 text-sm text-text-secondary">
            El texto de esta transcripción no está disponible.
          </p>
        </div>
      </section>

      <div v-else-if="displayStatus === 'processing'" class="rounded-xl border border-border bg-background px-6 py-10">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-loader-circle" class="mt-0.5 size-5 animate-spin text-primary" />
          <div>
            <h2 class="text-sm font-semibold text-foreground">La transcripción se está procesando.</h2>
            <p class="mt-1 text-sm text-text-secondary">Esto puede tardar unos minutos.</p>
          </div>
        </div>
      </div>

      <div v-else class="rounded-xl border border-border bg-background px-6 py-10">
        <p class="text-sm font-medium text-foreground">No se pudo completar la transcripción.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import TranscriptionStatusBadge from "~/components/transcriptions/TranscriptionStatusBadge.vue";
import {
  getTranscription,
  getTranscriptionDownloadUrl,
} from "~/services/transcriptions.service";
import { formatShortDateEs } from "~/utils/date";
import { startBrowserDownload } from "~/utils/download";
import { PATH } from "~/utils/path";
import {
  TRANSCRIPTION_STATUS_MAP,
  TRANSCRIPTION_TYPE_LABELS,
} from "~/utils/transcriptions";

const route = useRoute();
const api = useApi();
const toast = useToast();
const transcriptionId = String(route.params.id);
const downloading = ref(false);

const {
  data: transcription,
  error,
  pending,
  refresh,
} = await useAsyncData(
  `transcription-${transcriptionId}`,
  () => getTranscription(api, transcriptionId),
  { server: false },
);

const displayStatus = computed(() =>
  transcription.value
    ? TRANSCRIPTION_STATUS_MAP[transcription.value.status]
    : "failed",
);
const isCompleted = computed(
  () => transcription.value?.status === "completed",
);
const isRealtime = computed(
  () => transcription.value?.type === "realtime",
);
const pageTitle = computed(() =>
  isRealtime.value
    ? "Transcripción en vivo"
    : transcription.value?.fileName ?? "Transcripción",
);

function handleRetry(): void {
  void refresh();
}

async function handleDownload(): Promise<void> {
  if (!isCompleted.value) {
    return;
  }

  downloading.value = true;

  try {
    startBrowserDownload(
      await getTranscriptionDownloadUrl(api, transcriptionId),
    );
  } catch {
    toast.add({
      color: "error",
      title: "No pudimos descargar la transcripción",
    });
  } finally {
    downloading.value = false;
  }
}

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});
</script>
