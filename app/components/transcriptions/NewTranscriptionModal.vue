<template>
  <UModal
    v-model:open="open"
    title="Nueva transcripción"
    description="Elige cómo quieres comenzar."
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
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
            class="w-full"
            :disabled="loading"
            @change="handleFileChange"
          />
        </UFormField>
        <p class="text-xs text-text-muted">
          Máximo 20 MB. Formatos: MP3, WAV, M4A, AAC, OGG y FLAC.
        </p>
        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          title="No pudimos subir el archivo"
          :description="error"
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
          :disabled="loading"
          @click="resetMethod"
        />
        <UButton
          label="Subir archivo"
          icon="i-lucide-upload"
          class="cursor-pointer"
          :disabled="!selectedFile || loading"
          :loading="loading"
          @click="handleUploadClick"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { getFirstInputFile } from "~/utils/files";
import type { TranscriptionType } from "~/types/transcription";

const open = defineModel<boolean>("open", { default: false });

const toast = useToast();

const method = ref<TranscriptionType | null>(null);

const selectedFile = ref<File | null>(null);

const { clearError, error, loading, upload } = useAudioUpload();

function selectFileMethod(): void {
  method.value = "file";
}

function handleRealtimeClick(): void {
  return;
}

function handleFileChange(event: Event): void {
  selectedFile.value = getFirstInputFile(event);

  clearError();
}

async function handleUploadClick(): Promise<void> {
  if (!selectedFile.value) {
    return;
  }

  try {
    await upload(selectedFile.value);

    toast.add({
      color: "success",
      title: "Archivo subido",
      description: "El archivo se subió correctamente.",
    });

    open.value = false;
  } catch {
    return;
  }
}

function resetMethod(): void {
  method.value = null;

  selectedFile.value = null;

  clearError();
}

watch(open, (isOpen) => {
  if (!isOpen) {
    resetMethod();
  }
});
</script>
