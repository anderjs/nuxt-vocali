import { Hub } from "aws-amplify/utils";
import { OAUTH_CALLBACK_TIMEOUT_MS } from "~/utils/constants";

/**
 * Waits for Amplify to finish handling the current OAuth redirect.
 *
 * The timeout keeps app initialization moving if Amplify does not emit its
 * terminal Hub event.
 */
export function waitForOAuthCallback(): Promise<void> {
  return new Promise<void>((resolve): void => {
    function finish(): void {
      window.clearTimeout(timeoutId);

      stopListening();

      resolve();
    }

    const stopListening = Hub.listen("auth", ({ payload }): void => {
      if (
        payload.event === "signInWithRedirect" ||
        payload.event === "signInWithRedirect_failure"
      ) {
        finish();
      }
    });

    const timeoutId = window.setTimeout(finish, OAUTH_CALLBACK_TIMEOUT_MS);
  });
}
