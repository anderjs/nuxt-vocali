import {
  signIn as cognitoSignIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  signInWithRedirect,
} from "aws-amplify/auth";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { authUserSchema, type AuthUser } from "~/schemas/auth.schema";
import { PATH } from "~/utils/path";

export const useAuthStore = defineStore("authStore", () => {
  const user = ref<AuthUser | null>(null);
  const loading = ref(true);
  const initialized = ref(false);
  const isAuthenticated = computed(() => Boolean(user.value));

  let initializationPromise: Promise<void> | null = null;

  async function initialize(force = false): Promise<void> {
    if (initialized.value && !force) {
      return;
    }

    if (initializationPromise) {
      return initializationPromise;
    }

    initializationPromise = (async () => {
      loading.value = true;

      try {
        const [currentUser, session] = await Promise.all([
          getCurrentUser(),
          fetchAuthSession(),
        ]);

        user.value = authUserSchema.parse({
          id: currentUser.userId,
          email: session.tokens?.idToken?.payload.email,
          username: currentUser.username,
        });
      } catch {
        user.value = null;
      } finally {
        loading.value = false;
        initialized.value = true;
        initializationPromise = null;
      }
    })();

    return initializationPromise;
  }

  async function signIn(email: string, password: string): Promise<void> {
    const result = await cognitoSignIn({
      username: email,
      password,
    });

    if (!result.isSignedIn) {
      throw new Error(
        `Unsupported Cognito sign-in step: ${result.nextStep.signInStep}`,
      );
    }

    await initialize(true);
  }

  async function signInWithGoogle(): Promise<void> {
    await signInWithRedirect({
      provider: "Google",
      options: { lang: "es" },
    });
  }

  function clearSession(): void {
    user.value = null;

    loading.value = false;

    initialized.value = true;
  }

  async function logout(): Promise<void> {
    try {
      await signOut();
    } finally {
      clearSession();

      await navigateTo(PATH.LOGIN);
    }
  }

  return {
    user,
    logout,
    signIn,
    loading,
    initialize,
    initialized,
    clearSession,
    isAuthenticated,
    signInWithGoogle,
  };
});
