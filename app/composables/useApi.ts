import { PATH } from "~/utils/path";
import { useAuthStore } from "~/stores/auth";
import { getAccessToken } from "~/utils/auth-session";
import type { UnauthorizedErrorCandidate } from "~/common/types";

type ApiFetchRequest = Parameters<typeof $fetch>[0];
type ApiFetchOptions = Parameters<typeof $fetch>[1];

export interface ApiClient {
  request<T>(path: ApiFetchRequest, options?: ApiFetchOptions): Promise<T>;
}

function isUnauthorized(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as UnauthorizedErrorCandidate;

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
        throw createError({
          statusCode: HttpStatusCode.UNAUTHORIZED,
          statusMessage: "Unauthorized",
        });
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
        await navigateTo(PATH.LOGIN);
      }

      throw error;
    }
  }

  return { request };
}
