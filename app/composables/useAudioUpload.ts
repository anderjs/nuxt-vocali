import {
  createUploadUrl,
  uploadFileToSignedUrl,
} from "~/services/upload.service";
import { MAX_AUDIO_UPLOAD_SIZE_BYTES } from "~/utils/constants";

export function useAudioUpload() {
  const api = useApi();

  const error = ref<string | null>(null);

  const loading = ref(false);

  async function upload(file: File): Promise<string> {
    error.value = null;

    loading.value = true;

    try {
      if (file.size > MAX_AUDIO_UPLOAD_SIZE_BYTES) {
        throw new Error("El archivo no puede superar los 20 MB.");
      }

      const upload = await createUploadUrl(api, file);

      await uploadFileToSignedUrl(upload.uploadUrl, file);

      return upload.objectKey;
    } catch (uploadError) {
      error.value =
        uploadError instanceof Error
          ? uploadError.message
          : "No pudimos subir el archivo.";
      throw uploadError;
    } finally {
      loading.value = false;
    }
  }

  function clearError(): void {
    error.value = null;
  }

  return {
    error,
    upload,
    loading,
    clearError,
  };
}
