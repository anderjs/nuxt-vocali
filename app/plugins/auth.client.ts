import "aws-amplify/auth/enable-oauth-listener";
import { Amplify } from "aws-amplify";
import { Hub } from "aws-amplify/utils";
import { useAuthStore } from "~/stores/auth";
import { OAUTH_CALLBACK_TIMEOUT_MS } from "~/utils/constants";
import { isOAuthCallbackUrl } from "~/utils/query";

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig();

  const authStore = useAuthStore();

  const isOAuthCallback = isOAuthCallbackUrl(
    window.location,
    config.public.cognitoRedirectUri,
  );

  let resolveOAuthCallback: (() => void) | undefined;
  const oauthCallback = isOAuthCallback
    ? new Promise<void>((resolve) => {
        resolveOAuthCallback = resolve;
      })
    : null;

  const stopListening = Hub.listen("auth", ({ payload }) => {
    if (
      payload.event === "signInWithRedirect" ||
      payload.event === "signInWithRedirect_failure"
    ) {
      resolveOAuthCallback?.();
    }
  });

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.public.cognitoUserPoolId,
        userPoolClientId: config.public.cognitoClientId,
        loginWith: {
          oauth: {
            domain: config.public.cognitoDomain,
            scopes: config.public.cognitoScope.split(" ").filter(Boolean),
            redirectSignIn: [config.public.cognitoRedirectUri],
            redirectSignOut: [config.public.cognitoLogoutRedirectUri],
            responseType: "code",
          },
        },
      },
    },
  });

  if (oauthCallback) {
    await Promise.race([
      oauthCallback,
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, OAUTH_CALLBACK_TIMEOUT_MS);
      }),
    ]);
  }

  await authStore.initialize(true);

  stopListening();
});
