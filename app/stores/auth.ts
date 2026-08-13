import {
  signIn as cognitoSignIn,
  signOut,
  getCurrentUser,
  fetchUserAttributes,
  signInWithRedirect,
} from "aws-amplify/auth";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { authUserSchema, type AuthUser } from "~/schemas/auth.schema";

export const useAuthStore = defineStore("authStore", () => {
  const user = ref<AuthUser | null>(null);
  const loading = ref(true);
  const initialized = ref(false);
  const isAuthenticated = computed(() => user.value !== null);

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
        const [currentUser, attributes] = await Promise.all([
          getCurrentUser(),
          fetchUserAttributes(),
        ]);

        user.value = authUserSchema.parse({
          id: currentUser.userId,
          username: currentUser.username,
          email: attributes.email,
        });
      } catch {
        user.value = null;
      } finally {
        initialized.value = true;
        loading.value = false;
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
      throw new Error(`Unsupported Cognito sign-in step: ${result.nextStep.signInStep}`);
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
      await navigateTo("/login");
    }
  }

  return {
    user,
    loading,
    initialized,
    isAuthenticated,
    initialize,
    signIn,
    signInWithGoogle,
    clearSession,
    logout,
  };
});
