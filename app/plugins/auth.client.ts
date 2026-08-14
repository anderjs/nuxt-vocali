import "aws-amplify/auth/enable-oauth-listener";
import { Amplify } from "aws-amplify";
import { useAuthStore } from "~/stores/auth";
import { waitForOAuthCallback } from "~/utils/auth-oauth";
import { isOAuthCallbackUrl } from "~/utils/query";

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig();

  const authStore = useAuthStore();

  const isOAuthCallback = isOAuthCallbackUrl(
    window.location,
    config.public.cognitoRedirectUri,
  );

  const oauthCallback = isOAuthCallback
    ? waitForOAuthCallback()
    : Promise.resolve();

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

  await oauthCallback;

  await authStore.initialize(true);
});
