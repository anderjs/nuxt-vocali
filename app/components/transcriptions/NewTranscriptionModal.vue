<template>
  <UModal
    v-model:open="open"
    title="Nueva transcripción"
    description="Elige cómo quieres comenzar."
    :ui="newTranscriptionModalUi"
  >
    <template #body>
      <div v-if="!method" class="grid gap-3 sm:grid-cols-2">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-file-audio"
          label="Subir archivo"
          class="h-24 cursor-pointer justify-center"
          @click="selectFileMethod"
        />
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-mic"
          label="Transcribir en tiempo real"
          class="h-24 cursor-pointer justify-center"
          @click="handleRealtimeClick"
        />
      </div>

      <div v-else-if="method === 'file'" class="space-y-4">
        <UFormField label="Archivo de audio" name="audio">
          <UInput
            :key="fileInputKey"
            type="file"
            color="primary"
            variant="outline"
            :accept="AUDIO_FILE_ACCEPT"
            :ui="audioFileInputUi"
            :disabled="uploadLoading"
            @change="handleFileChange"
          />
        </UFormField>
        <p class="text-xs text-text-muted">
          Máximo 20 MB. Formatos: MP3, WAV, M4A, AAC, OGG y FLAC.
        </p>
        <div
          v-if="selectedFile"
          :class="selectedAudioFileCardClass"
        >
          <div :class="selectedAudioFileMetaClass">
            <p class="min-w-0 truncate text-sm font-medium text-foreground">
              {{ selectedFile.name }}
            </p>
            <p class="shrink-0 text-sm text-text-muted">
              {{ formatFileSize(selectedFile.size) }}
            </p>
          </div>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            aria-label="Quitar archivo"
            :class="selectedAudioFileRemoveButtonClass"
            :disabled="uploadLoading"
            @click="clearSelectedFile"
          />
        </div>
        <div v-if="uploadLoading" class="space-y-2">
          <div class="flex items-center justify-between gap-3 text-xs">
            <span class="text-text-secondary">{{ uploadStatusLabel }}</span>
            <span
              v-if="uploadStatus === TranscriptionUploadStatus.UPLOADING"
              class="text-text-muted"
            >
              {{ uploadProgress }}%
            </span>
          </div>
          <UProgress
            :model-value="uploadProgress"
            :max="100"
            color="primary"
            size="sm"
          />
        </div>
        <UAlert
          v-if="uploadError"
          color="neutral"
          variant="soft"
          icon="i-lucide-circle-alert"
          title="No se pudo usar el archivo"
          :description="uploadError"
        />
      </div>

      <div v-else class="space-y-4">
        <p class="text-sm text-text-secondary">
          Usa el micrófono para transcribir la conversación en tiempo real.
        </p>

        <div
          class="min-h-32 rounded-lg border border-border bg-background p-4"
        >
          <p
            v-if="!transcript && !partialTranscript"
            class="text-sm text-text-muted"
          >
            La transcripción aparecerá aquí.
          </p>
          <p v-else class="whitespace-pre-wrap text-sm text-foreground">
            {{ transcript }}
            <span v-if="partialTranscript" class="text-text-muted">
              {{ partialTranscript }}
            </span>
          </p>
        </div>

        <UAlert
          v-if="realtimeError || realtimePersistenceError"
          color="error"
          variant="soft"
          title="No pudimos guardar la transcripción"
          :description="realtimePersistenceError ?? realtimeError ?? undefined"
        />
      </div>
    </template>

    <template v-if="method" #footer>
      <div class="flex w-full items-center justify-between gap-3">
        <UButton
          color="neutral"
          variant="ghost"
          label="Volver"
          class="cursor-pointer"
          :disabled="uploadLoading || isRealtimeBusy"
          @click="resetMethod"
        />
        <UButton
          v-if="method === 'file'"
          label="Subir archivo"
          icon="i-lucide-upload"
          class="cursor-pointer"
          :disabled="!selectedFile || uploadLoading"
          :loading="uploadLoading"
          @click="handleUploadClick"
        />
        <UButton
          v-else
          :label="realtimeButtonLabel"
          :icon="realtimeButtonIcon"
          class="cursor-pointer"
          :color="isRecording ? 'neutral' : 'primary'"
          :variant="isRecording ? 'outline' : 'solid'"
          :loading="isRealtimeBusy"
          @click="handleRealtimeToggle"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import {
  TranscriptionUploadStatus,
  type NewTranscriptionModalEmit,
} from "~/common/types";
import {
  AUDIO_FILE_ACCEPT,
  clearInputFile,
  formatFileSize,
  getFirstInputFile,
} from "~/utils/files";
import {
  audioFileInputUi,
  newTranscriptionModalUi,
  selectedAudioFileCardClass,
  selectedAudioFileMetaClass,
  selectedAudioFileRemoveButtonClass,
} from "~/utils/transcription-upload-ui";
import type { TranscriptionType } from "~/types/transcription";
import { createRealtimeTranscription } from "~/services/transcriptions.service";

const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<NewTranscriptionModalEmit>();

const toast = useToast();
const api = useApi();

const method = ref<TranscriptionType | null>(null);

const selectedFile = ref<File | null>(null);

const fileInputKey = ref(0);

const {
  error: uploadError,
  loading: uploadLoading,
  progress: uploadProgress,
  reset: resetUpload,
  status: uploadStatus,
  upload,
  validateFile,
} = useAudioUpload();

const uploadStatusLabel = computed(() =>
  uploadStatus.value === TranscriptionUploadStatus.CREATING
    ? "Preparando transcripción…"
    : "Subiendo archivo…",
);

const {
  complete: completeRealtimeSession,
  error: realtimeError,
  isConnecting,
  isRecording,
  isStopping,
  partialTranscript,
  start: startRealtimeTranscription,
  stop: stopRealtimeTranscription,
  transcript,
} = useRealtimeTranscription();

const realtimePersistenceError = ref<string | null>(null);
const realtimeStartedAt = ref<string | null>(null);
const isPersistingRealtime = ref(false);

const canRetryRealtimePersistence = computed(
  () =>
    Boolean(realtimePersistenceError.value) &&
    Boolean(realtimeStartedAt.value) &&
    Boolean(transcript.value.trim()),
);
const isRealtimeBusy = computed(
  () =>
    isConnecting.value || isStopping.value || isPersistingRealtime.value,
);

const realtimeButtonLabel = computed(() => {
  if (isStopping.value) {
    return "Deteniendo...";
  }

  if (isPersistingRealtime.value) {
    return "Guardando...";
  }

  if (canRetryRealtimePersistence.value) {
    return "Reintentar guardar";
  }

  return isRecording.value ? "Detener" : "Iniciar transcripción";
});

const realtimeButtonIcon = computed(() => {
  if (canRetryRealtimePersistence.value) {
    return "i-lucide-refresh-cw";
  }

  return isRecording.value ? "i-lucide-square" : "i-lucide-mic";
});

function selectFileMethod(): void {
  method.value = "file";
}

function handleRealtimeClick(): void {
  method.value = "realtime";
}

function handleFileChange(event: Event): void {
  const file = getFirstInputFile(event);

  if (!file) {
    selectedFile.value = null;
    resetUpload();
    return;
  }

  if (!validateFile(file)) {
    selectedFile.value = null;
    clearInputFile(event);
    return;
  }

  selectedFile.value = file;
}

function clearSelectedFile(): void {
  selectedFile.value = null;
  fileInputKey.value += 1;
  resetUpload();
}

async function persistRealtimeTranscription(): Promise<boolean> {
  const text = transcript.value.trim();
  const startedAt = realtimeStartedAt.value;

  if (!text || !startedAt) {
    completeRealtimeSession();
    return true;
  }

  isPersistingRealtime.value = true;

  try {
    const transcription = await createRealtimeTranscription(api, {
      endedAt: new Date().toISOString(),
      startedAt,
      text,
    });

    emit("uploaded", transcription);
    open.value = false;
    return true;
  } catch {
    realtimePersistenceError.value =
      "La transcripción está disponible, pero no pudimos guardarla. Inténtalo nuevamente.";
    toast.add({
      color: "error",
      title: "No pudimos guardar la transcripción",
    });
    return false;
  } finally {
    completeRealtimeSession();
    isPersistingRealtime.value = false;
  }
}

async function stopAndPersistRealtimeTranscription(): Promise<boolean> {
  await stopRealtimeTranscription();
  return persistRealtimeTranscription();
}

async function handleRealtimeToggle(): Promise<void> {
  if (canRetryRealtimePersistence.value) {
    realtimePersistenceError.value = null;
    await persistRealtimeTranscription();
    return;
  }

  if (isRecording.value) {
    await stopAndPersistRealtimeTranscription();
    return;
  }

  realtimePersistenceError.value = null;
  realtimeStartedAt.value = new Date().toISOString();
  await startRealtimeTranscription();

  if (!isRecording.value) {
    realtimeStartedAt.value = null;
  }
}

async function handleUploadClick(): Promise<void> {
  if (!selectedFile.value) {
    return;
  }

  try {
    const transcription = await upload(selectedFile.value);

    toast.add({
      color: "success",
      title: "Archivo subido",
      description: "La transcripción quedó preparada correctamente.",
    });

    emit("uploaded", transcription);
    open.value = false;
  } catch {
    return;
  }
}

async function resetMethod(): Promise<void> {
  if (isRecording.value || isConnecting.value || isStopping.value) {
    const persisted = await stopAndPersistRealtimeTranscription();

    if (!persisted) {
      open.value = true;
      return;
    }
  }

  method.value = null;
  realtimeStartedAt.value = null;
  clearSelectedFile();
}

watch(open, (isOpen) => {
  if (!isOpen && isPersistingRealtime.value) {
    open.value = true;
    return;
  }

  if (!isOpen) {
    void resetMethod();
  }
});
</script>
