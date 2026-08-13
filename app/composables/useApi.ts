import { getAccessToken } from "~/utils/auth-session";
import { useAuthStore } from "~/stores/auth";

type ApiFetchRequest = Parameters<typeof $fetch>[0];
type ApiFetchOptions = Parameters<typeof $fetch>[1];

function isUnauthorized(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    status?: number;
    statusCode?: number;
    response?: { status?: number };
  };

  return (
    candidate.status === 401 ||
    candidate.statusCode === 401 ||
    candidate.response?.status === 401
  );
}

export function useApi() {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  async function request<T>(
    path: ApiFetchRequest,
    options: ApiFetchOptions = {},
  ): Promise<T> {
    const execute = async (forceRefresh = false): Promise<T> => {
      const accessToken = await getAccessToken(forceRefresh);

      if (!accessToken) {
        throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
      }

      const headers = new Headers(options.headers);
      headers.set("Authorization", `Bearer ${accessToken}`);

      return await $fetch<T>(path, {
        ...options,
        baseURL: config.public.apiBase,
        headers,
      });
    };

    try {
      return await execute();
    } catch (error) {
      if (!isUnauthorized(error)) {
        throw error;
      }
    }

    try {
      return await execute(true);
    } catch (error) {
      if (isUnauthorized(error)) {
        authStore.clearSession();
        await navigateTo("/login");
      }

      throw error;
    }
  }

  return { request };
}
