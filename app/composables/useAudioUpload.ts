import {
  createFileTranscription,
  createUploadUrl,
  uploadFileToSignedUrl,
} from "~/services/upload.service";
import type { CreatedTranscription } from "~/schemas/transcription.schema";
import { TranscriptionUploadStatus } from "~/common/types";
import { getAudioFileValidationError } from "~/utils/files";

export function useAudioUpload() {
  const api = useApi();

  const error = ref<string | null>(null);

  const progress = ref(0);

  const status = ref(TranscriptionUploadStatus.IDLE);

  const loading = computed(
    () =>
      status.value === TranscriptionUploadStatus.UPLOADING ||
      status.value === TranscriptionUploadStatus.CREATING,
  );

  async function upload(file: File): Promise<CreatedTranscription> {
    error.value = null;

    if (!validateFile(file)) {
      throw new Error("Invalid audio file");
    }

    progress.value = 0;
    status.value = TranscriptionUploadStatus.UPLOADING;

    try {
      const upload = await createUploadUrl(api, file);

      await uploadFileToSignedUrl(upload.uploadUrl, file, (value) => {
        progress.value = value;
      });

      status.value = TranscriptionUploadStatus.CREATING;

      const transcription = await createFileTranscription(
        api,
        file,
        upload.objectKey,
      );

      status.value = TranscriptionUploadStatus.SUCCESS;

      return transcription;
    } catch (uploadError) {
      error.value ??=
        status.value === TranscriptionUploadStatus.CREATING
          ? "El archivo se subió, pero no pudimos preparar la transcripción. Inténtalo de nuevo."
          : "No pudimos subir el archivo. Inténtalo de nuevo.";
      status.value = TranscriptionUploadStatus.ERROR;
      throw uploadError;
    }
  }

  function validateFile(file: File): boolean {
    error.value = getAudioFileValidationError(file);

    status.value = error.value
      ? TranscriptionUploadStatus.ERROR
      : TranscriptionUploadStatus.SELECTED;

    return error.value === null;
  }

  function reset(): void {
    error.value = null;
    progress.value = 0;
    status.value = TranscriptionUploadStatus.IDLE;
  }

  return {
    error,
    loading,
    progress,
    reset,
    status,
    upload,
    validateFile,
  };
}
