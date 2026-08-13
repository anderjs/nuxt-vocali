import { PATH } from "~/utils/path";
import { useAuthStore } from "~/stores/auth";
import { getAccessToken } from "~/utils/auth-session";
import {
  HttpHeader,
  hasHttpStatus,
  HttpStatusCode,
  HttpStatusMessage,
  getBearerAuthorizationHeader,
} from "~/utils/http";
import type { ApiFetchOptions, ApiFetchRequest } from "~/common/types";

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
          statusMessage: HttpStatusMessage.UNAUTHORIZED,
        });
      }

      const headers = new Headers(options.headers);

      headers.set(
        HttpHeader.AUTHORIZATION,
        getBearerAuthorizationHeader(accessToken),
      );

      return await $fetch<T>(path, {
        ...options,
        baseURL: config.public.apiBase,
        headers,
      });
    };

    try {
      return await execute();
    } catch (error) {
      if (!hasHttpStatus(error, HttpStatusCode.UNAUTHORIZED)) {
        throw error;
      }
    }

    try {
      return await execute(true);
    } catch (error) {
      if (hasHttpStatus(error, HttpStatusCode.UNAUTHORIZED)) {
        authStore.clearSession();
        await navigateTo(PATH.LOGIN);
      }

      throw error;
    }
  }

  return { request };
}
