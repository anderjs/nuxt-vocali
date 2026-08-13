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
          />
        </UFormField>
        <p class="text-xs text-text-muted">
          Máximo 20 MB. Formatos: MP3, WAV, M4A, AAC, OGG y FLAC.
        </p>
      </div>
    </template>

    <template v-if="method" #footer>
      <UButton
        color="neutral"
        variant="ghost"
        label="Volver"
        class="cursor-pointer"
        @click="resetMethod"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { TranscriptionType } from "~/types/transcription";

const open = defineModel<boolean>("open", { default: false });

const method = ref<TranscriptionType | null>(null);

function selectFileMethod(): void {
  method.value = "file";
}

function handleRealtimeClick(): void {
  return;
}

function resetMethod(): void {
  method.value = null;
}

watch(open, (isOpen) => {
  if (!isOpen) {
    method.value = null;
  }
});
</script>
