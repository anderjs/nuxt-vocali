<template>
  <UBadge
    :color="config.color"
    variant="soft"
    :label="config.label"
    class="transition-colors duration-200"
  />
</template>

<script setup lang="ts">
import type { TranscriptionStatus } from "~/types/transcription";
import { TRANSCRIPTION_STATUS_CONFIG } from "~/utils/transcriptions";

const props = defineProps<{
  status: TranscriptionStatus;
}>();

const config = computed(() => TRANSCRIPTION_STATUS_CONFIG[props.status]);
</script>
